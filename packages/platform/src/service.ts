import { createHash, randomBytes, randomUUID } from "node:crypto";
import { sql, type Kysely, type Transaction } from "kysely";
import {
  NORMALIZATION_VERSION,
  canUndo,
  fixtureMeaning,
  normalizePastedText,
  type ImportCommandResult,
  type LanguageAnalyzer,
  type BookIndexView,
  type LibraryItemView,
  type OccurrenceContextView,
  type ProgressSummaryView,
  type ReaderPositionView,
  type ReaderView,
  type SessionIdentity,
  type TokenAnalysis,
  type SliceApplication,
  type VocabularyListView,
  type VocabularyMutationView,
} from "@readify/modules";
import type { ProcessingStatus, VocabularyState } from "@readify/contracts";
import { createDatabase, type Database } from "./database/client";
import {
  FrancFrenchDetector,
  type FrenchLanguageDetector,
} from "./language-detection";
import { logEvent } from "./logging";
import { RecordedLanguageAnalyzer } from "./language-analyzer";

type Executor = Kysely<Database> | Transaction<Database>;
type Clock = () => Date;
type IdFactory = (prefix: string) => string;

const ALLOWED_RETURN_PATHS = new Set(["/library"]);
const SAFE_JOB_ERROR_CODES = new Set([
  "language_analyzer_busy",
  "language_analyzer_cancelled",
  "language_analyzer_input_too_large",
  "language_analyzer_invalid_response",
  "language_analyzer_offset_mismatch",
  "language_analyzer_process_exited",
  "language_analyzer_response_too_large",
  "language_analyzer_timeout",
  "unknown_job_kind",
  "workflow_not_found",
]);

function classifyJobError(error: unknown): string {
  if (error instanceof Error && SAFE_JOB_ERROR_CODES.has(error.message))
    return error.message;
  return "job_execution_failed";
}

export class AppError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    readonly metadata: Record<string, unknown> = {},
  ) {
    super(code);
  }
}

export class ReadifyService implements SliceApplication {
  constructor(
    readonly database = createDatabase(),
    private readonly now: Clock = () => new Date(),
    private readonly id: IdFactory = (prefix) =>
      `${prefix}_${randomUUID().replaceAll("-", "")}`,
    private readonly languageDetector: FrenchLanguageDetector = new FrancFrenchDetector(),
    private readonly languageAnalyzer: LanguageAnalyzer & {
      close?: () => void;
    } = new RecordedLanguageAnalyzer(),
  ) {}

  async close(): Promise<void> {
    this.languageAnalyzer.close?.();
    await this.database.destroy();
  }

  async ready(): Promise<boolean> {
    try {
      await sql`select 1`.execute(this.database);
      return true;
    } catch {
      return false;
    }
  }

  private hash(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  private timestamp(): string {
    return this.now().toISOString();
  }

  async requestEmailProof(
    email: string,
    returnPath: string,
  ): Promise<{ proof: string; expiresAt: string }> {
    const normalizedEmail = email.trim().toLocaleLowerCase("en-US");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(normalizedEmail))
      throw new AppError("invalid_email", 422);
    if (!ALLOWED_RETURN_PATHS.has(returnPath))
      throw new AppError("invalid_return_path", 422);
    const proof = randomBytes(32).toString("base64url");
    const expiresAt = new Date(
      this.now().getTime() + 15 * 60_000,
    ).toISOString();
    await sql`insert into auth_proofs (id, email_normalized, proof_hash, return_path, expires_at, created_at)
      values (${this.id("proof")}, ${normalizedEmail}, ${this.hash(proof)}, ${returnPath}, ${expiresAt}, ${this.timestamp()})`.execute(
      this.database,
    );
    return { proof, expiresAt };
  }

  async consumeEmailProof(proof: string): Promise<{
    sessionToken: string;
    returnPath: string;
    identity: SessionIdentity;
  }> {
    const proofHash = this.hash(proof);
    return this.database.transaction().execute(async (transaction) => {
      const found = await sql<{
        id: string;
        email_normalized: string;
        return_path: string;
        expires_at: Date;
        consumed_at: Date | null;
      }>`
        select id, email_normalized, return_path, expires_at, consumed_at from auth_proofs where proof_hash = ${proofHash} for update
      `.execute(transaction);
      const record = found.rows[0];
      if (
        !record ||
        record.consumed_at ||
        record.expires_at.getTime() <= this.now().getTime()
      )
        throw new AppError("invalid_or_expired_proof", 401);
      await sql`update auth_proofs set consumed_at = ${this.timestamp()} where id = ${record.id}`.execute(
        transaction,
      );
      const users = await sql<{
        id: string;
      }>`select id from users where email_normalized = ${record.email_normalized}`.execute(
        transaction,
      );
      const userId = users.rows[0]?.id ?? this.id("usr");
      if (!users.rows[0])
        await sql`insert into users (id, email_normalized, created_at) values (${userId}, ${record.email_normalized}, ${this.timestamp()})`.execute(
          transaction,
        );
      const sessionToken = randomBytes(32).toString("base64url");
      await sql`insert into sessions (id, user_id, token_hash, expires_at, created_at)
        values (${this.id("ses")}, ${userId}, ${this.hash(sessionToken)}, ${new Date(this.now().getTime() + 30 * 86_400_000).toISOString()}, ${this.timestamp()})`.execute(
        transaction,
      );
      return {
        sessionToken,
        returnPath: record.return_path,
        identity: { userId, email: record.email_normalized },
      };
    });
  }

  async authenticate(
    sessionToken: string | undefined,
  ): Promise<SessionIdentity> {
    if (!sessionToken) throw new AppError("authentication_required", 401);
    const result = await sql<{ user_id: string; email_normalized: string }>`
      select s.user_id, u.email_normalized from sessions s join users u on u.id = s.user_id
      where s.token_hash = ${this.hash(sessionToken)} and s.revoked_at is null and s.expires_at > ${this.timestamp()}
    `.execute(this.database);
    const row = result.rows[0];
    if (!row) throw new AppError("authentication_required", 401);
    return { userId: row.user_id, email: row.email_normalized };
  }

  async signOut(sessionToken: string): Promise<void> {
    await sql`update sessions set revoked_at = ${this.timestamp()} where token_hash = ${this.hash(sessionToken)} and revoked_at is null`.execute(
      this.database,
    );
  }

  async getProfile(
    userId: string,
  ): Promise<{ targetLanguage: "fr"; startingLevel: string } | null> {
    const result = await sql<{
      target_language: "fr";
      starting_level: string;
    }>`select target_language, starting_level from learning_profiles where user_id = ${userId}`.execute(
      this.database,
    );
    const profile = result.rows[0];
    return profile
      ? {
          targetLanguage: profile.target_language,
          startingLevel: profile.starting_level,
        }
      : null;
  }

  async putProfile(
    userId: string,
    targetLanguage: string,
    startingLevel: string,
  ): Promise<{ targetLanguage: "fr"; startingLevel: string }> {
    if (targetLanguage !== "fr")
      throw new AppError("unsupported_target_language", 422);
    if (!new Set(["A1", "A2", "B1", "B2", "C1", "C2"]).has(startingLevel))
      throw new AppError("invalid_starting_level", 422);
    const existing = await this.getProfile(userId);
    if (existing) {
      if (existing.startingLevel !== startingLevel)
        throw new AppError("profile_already_created", 409);
      return existing;
    }
    await sql`insert into learning_profiles (user_id, target_language, starting_level, created_at) values (${userId}, 'fr', ${startingLevel}, ${this.timestamp()})`.execute(
      this.database,
    );
    return { targetLanguage: "fr", startingLevel };
  }

  async createPastedImport(
    userId: string,
    text: string,
    idempotencyKey: string,
    correlationId: string,
  ): Promise<ImportCommandResult> {
    if (!idempotencyKey || idempotencyKey.length > 200)
      throw new AppError("idempotency_key_required", 400);
    if (!(await this.getProfile(userId)))
      throw new AppError("learning_profile_required", 409);
    let normalized;
    try {
      normalized = normalizePastedText(text);
    } catch (error) {
      const code = error instanceof Error ? error.message : "invalid_text";
      throw new AppError(
        code,
        422,
        code === "text_too_long"
          ? {
              fieldErrors: [
                { field: "text", code: "max_scalar_values", limit: 50_000 },
              ],
            }
          : {},
      );
    }
    const assessment = this.languageDetector.assess(normalized.text);
    if (assessment.outcome === "mismatch")
      throw new AppError("language_mismatch", 422, {
        detectedLanguage: assessment.detectedLanguage,
      });
    const digest = this.hash(
      `${userId}:${NORMALIZATION_VERSION}:${normalized.text}`,
    );
    const requestHash = this.hash(JSON.stringify({ digest }));
    return this.database.transaction().execute(async (transaction) => {
      await sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:${digest}`}, 0))`.execute(
        transaction,
      );
      const idempotent = await sql<{
        request_hash: string;
        status: number;
        response: unknown;
      }>`select request_hash, status, response from idempotency_records where owner_id=${userId} and operation='create_import' and key=${idempotencyKey} and expires_at > ${this.timestamp()}`.execute(
        transaction,
      );
      if (idempotent.rows[0]) {
        if (idempotent.rows[0].request_hash !== requestHash)
          throw new AppError("idempotency_key_reused", 409);
        return {
          status: idempotent.rows[0].status,
          body: idempotent.rows[0].response as ImportCommandResult["body"],
        };
      }
      const duplicate = await sql<{
        id: string;
      }>`select id from source_revisions where owner_id=${userId} and account_digest=${digest}`.execute(
        transaction,
      );
      let status = 202;
      let body: ImportCommandResult["body"];
      if (duplicate.rows[0]) {
        const item = await this.libraryItemByRevision(
          transaction,
          userId,
          duplicate.rows[0].id,
        );
        status = 200;
        body = { outcome: "duplicate", libraryItem: item };
      } else {
        const revisionId = this.id("rev");
        const importId = this.id("imp");
        const libraryItemId = this.id("lib");
        const now = this.timestamp();
        await sql`insert into source_revisions (id, owner_id, normalized_text, normalization_version, account_digest, created_at) values (${revisionId}, ${userId}, ${normalized.text}, ${NORMALIZATION_VERSION}, ${digest}, ${now})`.execute(
          transaction,
        );
        await sql`insert into import_workflows (id, owner_id, source_revision_id, stage, text_capability, word_tools_capability, updated_at) values (${importId}, ${userId}, ${revisionId}, 'queued', 'pending', 'pending', ${now})`.execute(
          transaction,
        );
        await sql`insert into library_items (id, owner_id, import_id, source_revision_id, title, source_type, created_at) values (${libraryItemId}, ${userId}, ${importId}, ${revisionId}, ${normalized.title}, 'pasted_text', ${now})`.execute(
          transaction,
        );
        await this.enqueue(
          transaction,
          "prepare_text",
          userId,
          importId,
          correlationId,
          {},
        );
        body = {
          outcome: "created",
          libraryItem: await this.libraryItemById(
            transaction,
            userId,
            libraryItemId,
          ),
        };
      }
      await sql`insert into idempotency_records (owner_id, operation, key, request_hash, status, response, expires_at, created_at) values (${userId}, 'create_import', ${idempotencyKey}, ${requestHash}, ${status}, ${JSON.stringify(body)}::jsonb, ${new Date(this.now().getTime() + 86_400_000).toISOString()}, ${this.timestamp()})`.execute(
        transaction,
      );
      return { status, body };
    });
  }

  private async enqueue(
    executor: Executor,
    kind: string,
    ownerId: string,
    subjectId: string,
    correlationId: string,
    payload: object,
  ): Promise<void> {
    const now = this.timestamp();
    await sql`insert into jobs (id, kind, owner_id, subject_id, correlation_id, payload, available_at, created_at, updated_at) values (${this.id("job")}, ${kind}, ${ownerId}, ${subjectId}, ${correlationId}, ${JSON.stringify(payload)}::jsonb, ${now}, ${now}, ${now})`.execute(
      executor,
    );
  }

  private processing(row: Record<string, unknown>): ProcessingStatus {
    return {
      overall: row.overall as ProcessingStatus["overall"],
      stage: row.stage as ProcessingStatus["stage"],
      capabilities: {
        text: row.text_capability as ProcessingStatus["capabilities"]["text"],
        wordTools:
          row.word_tools_capability as ProcessingStatus["capabilities"]["wordTools"],
      },
      progress: null,
      retryableCapabilities: (row.retryable_capabilities as string[]) ?? [],
      error: row.error_code
        ? {
            code: String(row.error_code),
            referenceId: String(row.error_reference_id),
          }
        : null,
      version: Number(row.version),
      updatedAt: new Date(row.updated_at as string).toISOString(),
    };
  }

  private async libraryItemByRevision(
    executor: Executor,
    userId: string,
    revisionId: string,
  ) {
    const result = await sql<
      Record<string, unknown>
    >`select l.id, l.title, l.source_type, exists(select 1 from reader_positions rp where rp.owner_id=l.owner_id and rp.library_item_id=l.id) as has_saved_position, w.overall, w.stage, w.text_capability, w.word_tools_capability, w.retryable_capabilities, w.error_code, w.error_reference_id, w.version, w.updated_at from library_items l join import_workflows w on w.id=l.import_id where l.owner_id=${userId} and l.source_revision_id=${revisionId}`.execute(
      executor,
    );
    if (!result.rows[0]) throw new AppError("library_item_not_found", 404);
    return this.mapLibraryItem(result.rows[0]);
  }

  private async libraryItemById(
    executor: Executor,
    userId: string,
    itemId: string,
  ) {
    const result = await sql<
      Record<string, unknown>
    >`select l.id, l.title, l.source_type, exists(select 1 from reader_positions rp where rp.owner_id=l.owner_id and rp.library_item_id=l.id) as has_saved_position, w.overall, w.stage, w.text_capability, w.word_tools_capability, w.retryable_capabilities, w.error_code, w.error_reference_id, w.version, w.updated_at from library_items l join import_workflows w on w.id=l.import_id where l.owner_id=${userId} and l.id=${itemId}`.execute(
      executor,
    );
    if (!result.rows[0]) throw new AppError("library_item_not_found", 404);
    return this.mapLibraryItem(result.rows[0]);
  }

  private mapLibraryItem(row: Record<string, unknown>): LibraryItemView {
    return {
      id: String(row.id),
      title: String(row.title),
      sourceType: "pasted_text",
      readerAvailable: row.text_capability === "ready",
      hasSavedPosition: Boolean(row.has_saved_position),
      processing: this.processing(row),
    };
  }

  async listLibrary(userId: string) {
    const result = await sql<
      Record<string, unknown>
    >`select l.id, l.title, l.source_type, exists(select 1 from reader_positions rp where rp.owner_id=l.owner_id and rp.library_item_id=l.id) as has_saved_position, w.overall, w.stage, w.text_capability, w.word_tools_capability, w.retryable_capabilities, w.error_code, w.error_reference_id, w.version, w.updated_at from library_items l join import_workflows w on w.id=l.import_id where l.owner_id=${userId} order by l.created_at desc, l.id desc limit 20`.execute(
      this.database,
    );
    return {
      items: result.rows.map((row) => this.mapLibraryItem(row)),
      nextCursor: null,
    };
  }

  async getLibraryItem(userId: string, itemId: string) {
    return this.libraryItemById(this.database, userId, itemId);
  }

  async getBookIndex(userId: string, itemId: string): Promise<BookIndexView> {
    const item = await this.libraryItemById(this.database, userId, itemId);
    const result = await sql<{
      id: string;
      ordinal: number;
      completed: boolean;
    }>`
      select s.id, s.ordinal,
        exists(select 1 from section_completions c where c.owner_id=${userId} and c.section_id=s.id) as completed
      from sections s join library_items l on l.source_revision_id=s.source_revision_id
      where l.id=${itemId} and l.owner_id=${userId}
      order by s.ordinal
    `.execute(this.database);
    return {
      ...item,
      chapters: result.rows.map((section) => ({
        id: section.id,
        ordinal: Number(section.ordinal),
        title: `Bölüm ${Number(section.ordinal) + 1}`,
        completed: Boolean(section.completed),
        readerAvailable: item.readerAvailable,
      })),
    };
  }

  async claimAndRunOne(): Promise<boolean> {
    const job = await this.database
      .transaction()
      .execute(async (transaction) => {
        await sql`update jobs set status='queued', lease_until=null, available_at=${this.timestamp()}, updated_at=${this.timestamp()} where status='running' and lease_until < ${this.timestamp()}`.execute(
          transaction,
        );
        const result = await sql<{
          id: string;
          kind: string;
          owner_id: string;
          subject_id: string;
          correlation_id: string;
          attempt: number;
          max_attempts: number;
        }>`
        with candidate as (
          select id from jobs where status='queued' and available_at <= ${this.timestamp()}
          order by created_at for update skip locked limit 1
        )
        update jobs j set status='running', attempt=j.attempt+1, lease_until=${new Date(this.now().getTime() + 30_000).toISOString()}, heartbeat_at=${this.timestamp()}, updated_at=${this.timestamp()}
        from candidate where j.id=candidate.id
        returning j.id, j.kind, j.owner_id, j.subject_id, j.correlation_id, j.attempt, j.max_attempts
      `.execute(transaction);
        return result.rows[0];
      });
    if (!job) return false;
    const startedAt = Date.now();
    logEvent({
      correlationId: job.correlation_id,
      event: "job.attempt_started",
      stage: job.kind,
      attempt: job.attempt,
    });
    const heartbeat = setInterval(() => {
      void sql`update jobs set heartbeat_at=${this.timestamp()}, lease_until=${new Date(this.now().getTime() + 30_000).toISOString()}, updated_at=${this.timestamp()} where id=${job.id} and status='running'`
        .execute(this.database)
        .catch(() =>
          logEvent({
            correlationId: job.correlation_id,
            event: "job.heartbeat_failed",
            stage: job.kind,
            attempt: job.attempt,
            outcome: "database_error",
          }),
        );
    }, 10_000);
    try {
      if (job.kind === "prepare_text")
        await this.prepareText(
          job.owner_id,
          job.subject_id,
          job.correlation_id,
        );
      else if (job.kind === "analyze_language")
        await this.completeLanguageAnalysis(job.owner_id, job.subject_id);
      else if (job.kind === "project_progress")
        await this.projectProgress(job.owner_id);
      else throw new Error("unknown_job_kind");
      await sql`update jobs set status='succeeded', lease_until=null, updated_at=${this.timestamp()} where id=${job.id}`.execute(
        this.database,
      );
      logEvent({
        correlationId: job.correlation_id,
        event: "job.attempt_completed",
        stage: job.kind,
        attempt: job.attempt,
        durationMs: Date.now() - startedAt,
        outcome: "succeeded",
      });
    } catch (error) {
      const retry = job.attempt < job.max_attempts;
      const code = classifyJobError(error);
      await sql`update jobs set status=${retry ? "queued" : "failed"}::job_status, available_at=${new Date(this.now().getTime() + Math.min(30_000, 1000 * 2 ** job.attempt)).toISOString()}, lease_until=null, last_error_code=${code}, updated_at=${this.timestamp()} where id=${job.id}`.execute(
        this.database,
      );
      if (!retry)
        await this.markWorkflowFailure(job.subject_id, job.kind, code);
      logEvent({
        correlationId: job.correlation_id,
        event: "job.attempt_completed",
        stage: job.kind,
        attempt: job.attempt,
        durationMs: Date.now() - startedAt,
        outcome: retry ? "retry_scheduled" : "failed",
      });
    } finally {
      clearInterval(heartbeat);
    }
    return true;
  }

  private async prepareText(
    ownerId: string,
    importId: string,
    correlationId: string,
  ): Promise<void> {
    await this.database.transaction().execute(async (transaction) => {
      const result = await sql<{
        revision_id: string;
        normalized_text: string;
        version: number;
      }>`
        select w.source_revision_id as revision_id, r.normalized_text, w.version
        from import_workflows w join source_revisions r on r.id=w.source_revision_id
        where w.id=${importId} and w.owner_id=${ownerId} for update
      `.execute(transaction);
      const workflow = result.rows[0];
      if (!workflow) throw new Error("workflow_not_found");
      const existing = await sql<{
        id: string;
      }>`select id from sections where source_revision_id=${workflow.revision_id}`.execute(
        transaction,
      );
      if (!existing.rows[0]) {
        const sectionId = this.id("sec");
        await sql`insert into sections (id, source_revision_id, ordinal) values (${sectionId}, ${workflow.revision_id}, 0)`.execute(
          transaction,
        );
        const paragraphs = workflow.normalized_text.split(/\n[ \t]*\n/gu);
        for (const [paragraphOrdinal, paragraphText] of paragraphs.entries()) {
          const paragraphId = this.id("par");
          await sql`insert into paragraphs (id, section_id, ordinal, text) values (${paragraphId}, ${sectionId}, ${paragraphOrdinal}, ${paragraphText})`.execute(
            transaction,
          );
          const sentenceMatches = [
            ...paragraphText.matchAll(/[^.!?]+(?:[.!?]+|$)/gu),
          ].filter((match) => match[0].length > 0);
          for (const [sentenceOrdinal, match] of sentenceMatches.entries()) {
            const sentenceText = match[0];
            const startScalar = [...paragraphText.slice(0, match.index)].length;
            const endScalar = startScalar + [...sentenceText].length;
            const sentenceId = this.id("sen");
            await sql`insert into sentences (id, paragraph_id, ordinal, start_scalar, end_scalar, text) values (${sentenceId}, ${paragraphId}, ${sentenceOrdinal}, ${startScalar}, ${endScalar}, ${sentenceText})`.execute(
              transaction,
            );
          }
        }
      }
      await sql`update import_workflows set stage='analyzing_language', text_capability='ready', version=version+1, updated_at=${this.timestamp()} where id=${importId}`.execute(
        transaction,
      );
      await this.enqueue(
        transaction,
        "analyze_language",
        ownerId,
        importId,
        correlationId,
        {},
      );
    });
  }

  private async completeLanguageAnalysis(
    ownerId: string,
    importId: string,
  ): Promise<void> {
    const sentences = await sql<{
      revision_id: string;
      id: string;
      paragraph_id: string;
      ordinal: number;
      start_scalar: number;
      text: string;
    }>`
      select w.source_revision_id as revision_id, s.id, s.paragraph_id, s.ordinal, s.start_scalar, s.text
      from import_workflows w join sections se on se.source_revision_id=w.source_revision_id
      join paragraphs p on p.section_id=se.id join sentences s on s.paragraph_id=p.id
      where w.id=${importId} and w.owner_id=${ownerId} order by p.ordinal, s.ordinal
    `.execute(this.database);
    if (!sentences.rows[0]) throw new Error("workflow_content_not_found");
    const analyzed: Array<{
      sentence: (typeof sentences.rows)[number];
      tokens: TokenAnalysis[];
    }> = [];
    let provider = "";
    let providerVersion = "";
    for (const sentence of sentences.rows) {
      const result = await this.languageAnalyzer.analyze(
        sentence.text,
        AbortSignal.timeout(35_000),
      );
      if (
        provider &&
        (provider !== result.provider ||
          providerVersion !== result.providerVersion)
      )
        throw new Error("language_analyzer_provenance_changed");
      provider = result.provider;
      providerVersion = result.providerVersion;
      for (const token of result.tokens) {
        if (
          token.endScalar > [...sentence.text].length ||
          [...sentence.text]
            .slice(token.startScalar, token.endScalar)
            .join("") !== token.surface
        )
          throw new Error("language_analyzer_offset_mismatch");
      }
      analyzed.push({ sentence, tokens: result.tokens });
    }
    await this.database.transaction().execute(async (transaction) => {
      const result = await sql<{
        overall: string;
        source_revision_id: string;
      }>`select overall, source_revision_id from import_workflows where id=${importId} and owner_id=${ownerId} for update`.execute(
        transaction,
      );
      if (!result.rows[0]) throw new Error("workflow_not_found");
      const existing = await sql<{
        id: string;
      }>`select id from language_analyses where source_revision_id=${result.rows[0].source_revision_id}`.execute(
        transaction,
      );
      if (!existing.rows[0]) {
        for (const entry of analyzed)
          for (const [tokenOrdinal, token] of entry.tokens.entries()) {
            await sql`insert into lemmas (id, language, normalized_lemma, part_of_speech) values (${this.id("lem")}, 'fr', ${token.lemma}, ${token.partOfSpeech}) on conflict (language, normalized_lemma, part_of_speech, policy_version) do nothing`.execute(
              transaction,
            );
            const lemma = await sql<{
              id: string;
            }>`select id from lemmas where language='fr' and normalized_lemma=${token.lemma} and part_of_speech=${token.partOfSpeech} and policy_version=1`.execute(
              transaction,
            );
            if (!lemma.rows[0]) throw new Error("lemma_upsert_failed");
            await sql`insert into occurrences (id, paragraph_id, sentence_id, lemma_id, ordinal, surface, start_scalar, end_scalar) values (${this.id("occ")}, ${entry.sentence.paragraph_id}, ${entry.sentence.id}, ${lemma.rows[0].id}, ${entry.sentence.ordinal * 10_000 + tokenOrdinal}, ${token.surface}, ${entry.sentence.start_scalar + token.startScalar}, ${entry.sentence.start_scalar + token.endScalar}) on conflict (paragraph_id, ordinal) do nothing`.execute(
              transaction,
            );
          }
        await sql`insert into language_analyses (id, source_revision_id, provider, provider_version, created_at) values (${this.id("ana")}, ${result.rows[0].source_revision_id}, ${provider}, ${providerVersion}, ${this.timestamp()})`.execute(
          transaction,
        );
      }
      await sql`update import_workflows set overall='ready', stage='complete', text_capability='ready', word_tools_capability='ready', retryable_capabilities='{}', error_code=null, error_reference_id=null, version=version+1, updated_at=${this.timestamp()} where id=${importId}`.execute(
        transaction,
      );
    });
  }

  private async markWorkflowFailure(
    importId: string,
    kind: string,
    code: string,
  ): Promise<void> {
    const referenceId = this.id("ref");
    if (kind === "analyze_language") {
      await sql`update import_workflows set overall='ready_degraded', stage='complete', text_capability='ready', word_tools_capability='failed', retryable_capabilities=array['word_tools'], error_code='word_tools_unavailable', error_reference_id=${referenceId}, version=version+1, updated_at=${this.timestamp()} where id=${importId}`.execute(
        this.database,
      );
    } else {
      await sql`update import_workflows set overall='failed', stage='complete', text_capability='failed', word_tools_capability='failed', error_code='text_processing_failed', error_reference_id=${referenceId}, version=version+1, updated_at=${this.timestamp()} where id=${importId}`.execute(
        this.database,
      );
    }
    void code;
  }

  async retryCapability(
    userId: string,
    itemId: string,
    capability: string,
    idempotencyKey: string,
    correlationId: string,
  ): Promise<{ accepted: true }> {
    if (capability !== "word_tools")
      throw new AppError("capability_not_retryable", 409);
    return this.database.transaction().execute(async (transaction) => {
      const result = await sql<{
        import_id: string;
        retryable_capabilities: string[];
      }>`select l.import_id, w.retryable_capabilities from library_items l join import_workflows w on w.id=l.import_id where l.id=${itemId} and l.owner_id=${userId} for update`.execute(
        transaction,
      );
      const item = result.rows[0];
      if (!item) throw new AppError("library_item_not_found", 404);
      if (!item.retryable_capabilities.includes("word_tools"))
        throw new AppError("capability_not_retryable", 409);
      const requestHash = this.hash(JSON.stringify({ itemId, capability }));
      const previous = await sql<{
        request_hash: string;
        response: unknown;
      }>`select request_hash, response from idempotency_records where owner_id=${userId} and operation='retry_capability' and key=${idempotencyKey}`.execute(
        transaction,
      );
      if (previous.rows[0]) {
        if (previous.rows[0].request_hash !== requestHash)
          throw new AppError("idempotency_key_reused", 409);
        return previous.rows[0].response as { accepted: true };
      }
      await sql`update import_workflows set overall='processing', stage='analyzing_language', word_tools_capability='pending', retryable_capabilities='{}', error_code=null, error_reference_id=null, version=version+1, updated_at=${this.timestamp()} where id=${item.import_id}`.execute(
        transaction,
      );
      await this.enqueue(
        transaction,
        "analyze_language",
        userId,
        item.import_id,
        correlationId,
        {},
      );
      const response = { accepted: true } as const;
      await sql`insert into idempotency_records (owner_id, operation, key, request_hash, status, response, expires_at, created_at) values (${userId}, 'retry_capability', ${idempotencyKey}, ${requestHash}, 202, ${JSON.stringify(response)}::jsonb, ${new Date(this.now().getTime() + 86_400_000).toISOString()}, ${this.timestamp()})`.execute(
        transaction,
      );
      return response;
    });
  }

  async getReader(
    userId: string,
    itemId: string,
    sectionId?: string,
  ): Promise<ReaderView> {
    const itemResult = await sql<Record<string, unknown>>`
      select l.id as library_item_id, l.title, l.source_revision_id, w.overall, w.stage, w.text_capability,
        w.word_tools_capability, w.retryable_capabilities, w.error_code, w.error_reference_id, w.version, w.updated_at
      from library_items l join import_workflows w on w.id=l.import_id where l.id=${itemId} and l.owner_id=${userId}
    `.execute(this.database);
    const item = itemResult.rows[0];
    if (!item) throw new AppError("library_item_not_found", 404);
    if (item.text_capability !== "ready")
      throw new AppError("reader_not_ready", 409);
    const sections = await sql<{
      id: string;
      ordinal: number;
    }>`select id, ordinal from sections where source_revision_id=${String(item.source_revision_id)} order by ordinal`.execute(
      this.database,
    );
    const section = sectionId
      ? sections.rows.find((candidate) => candidate.id === sectionId)
      : sections.rows[0];
    if (!section) throw new AppError("reader_not_ready", 409);
    const paragraphs = await sql<{
      id: string;
      ordinal: number;
      text: string;
    }>`select id, ordinal, text from paragraphs where section_id=${section.id} order by ordinal limit 50`.execute(
      this.database,
    );
    const paragraphIds = paragraphs.rows.map((row) => row.id);
    const sentenceRows = paragraphIds.length
      ? await sql<{
          id: string;
          paragraph_id: string;
          ordinal: number;
          start_scalar: number;
          end_scalar: number;
        }>`select id, paragraph_id, ordinal, start_scalar, end_scalar from sentences where paragraph_id = any(${paragraphIds}) order by paragraph_id, ordinal`.execute(
          this.database,
        )
      : { rows: [] };
    const occurrenceRows = paragraphIds.length
      ? await sql<{
          id: string;
          paragraph_id: string;
          sentence_id: string;
          lemma_id: string;
          surface: string;
          start_scalar: number;
          end_scalar: number;
          vocabulary_state: VocabularyState | null;
        }>`
          select o.id, o.paragraph_id, o.sentence_id, o.lemma_id, o.surface, o.start_scalar, o.end_scalar,
            case when v.active then v.state else null end as vocabulary_state
          from occurrences o left join vocabulary_items v on v.lemma_id=o.lemma_id and v.owner_id=${userId} and v.language='fr'
          where o.paragraph_id = any(${paragraphIds}) order by o.paragraph_id, o.ordinal
        `.execute(this.database)
      : { rows: [] };
    const position = await sql<{
      source_revision_id: string;
      section_id: string;
      paragraph_id: string;
      sentence_id: string | null;
      version: number;
    }>`select source_revision_id, section_id, paragraph_id, sentence_id, version from reader_positions where owner_id=${userId} and library_item_id=${itemId} and section_id=${section.id}`.execute(
      this.database,
    );
    const completion = await sql<{
      completed_at: Date;
    }>`select completed_at from section_completions where owner_id=${userId} and section_id=${section.id}`.execute(
      this.database,
    );
    return {
      libraryItem: {
        id: String(item.library_item_id),
        title: String(item.title),
      },
      sourceRevisionId: String(item.source_revision_id),
      processing: this.processing(item),
      section: {
        id: section.id,
        ordinal: section.ordinal,
        completed: Boolean(completion.rows[0]),
      },
      paragraphs: paragraphs.rows.map((paragraph) => ({
        ...paragraph,
        sentences: sentenceRows.rows
          .filter((sentence) => sentence.paragraph_id === paragraph.id)
          .map((sentence) => ({
            id: sentence.id,
            ordinal: sentence.ordinal,
            startScalar: sentence.start_scalar,
            endScalar: sentence.end_scalar,
          })),
        occurrences: occurrenceRows.rows
          .filter((occurrence) => occurrence.paragraph_id === paragraph.id)
          .map((occurrence) => ({
            id: occurrence.id,
            sentenceId: occurrence.sentence_id,
            lemmaId: occurrence.lemma_id,
            surface: occurrence.surface,
            startScalar: occurrence.start_scalar,
            endScalar: occurrence.end_scalar,
            vocabularyState: occurrence.vocabulary_state,
          })),
      })),
      savedPosition: position.rows[0]
        ? {
            sourceRevisionId: position.rows[0].source_revision_id,
            anchor: {
              sectionId: position.rows[0].section_id,
              paragraphId: position.rows[0].paragraph_id,
              sentenceId: position.rows[0].sentence_id,
            },
            resolution: "exact",
            version: position.rows[0].version,
          }
        : null,
      nextCursor: null,
    };
  }

  async saveReaderPosition(
    userId: string,
    itemId: string,
    locator: {
      sourceRevisionId: string;
      sectionId: string;
      paragraphId: string;
      sentenceId?: string | null;
    },
  ): Promise<ReaderPositionView> {
    const valid = await sql<{
      revision_id: string;
    }>`select l.source_revision_id as revision_id from library_items l join sections s on s.source_revision_id=l.source_revision_id join paragraphs p on p.section_id=s.id where l.id=${itemId} and l.owner_id=${userId} and s.id=${locator.sectionId} and p.id=${locator.paragraphId}`.execute(
      this.database,
    );
    if (!valid.rows[0]) throw new AppError("library_item_not_found", 404);
    if (valid.rows[0].revision_id !== locator.sourceRevisionId)
      throw new AppError("source_revision_changed", 409);
    if (locator.sentenceId) {
      const sentence = await sql<{
        id: string;
      }>`select id from sentences where id=${locator.sentenceId} and paragraph_id=${locator.paragraphId}`.execute(
        this.database,
      );
      if (!sentence.rows[0]) throw new AppError("invalid_reader_position", 422);
    }
    const result = await sql<{
      version: number;
    }>`insert into reader_positions (owner_id, library_item_id, source_revision_id, section_id, paragraph_id, sentence_id, updated_at)
      values (${userId}, ${itemId}, ${locator.sourceRevisionId}, ${locator.sectionId}, ${locator.paragraphId}, ${locator.sentenceId ?? null}, ${this.timestamp()})
      on conflict (owner_id, library_item_id) do update set source_revision_id=excluded.source_revision_id, section_id=excluded.section_id, paragraph_id=excluded.paragraph_id, sentence_id=excluded.sentence_id, version=reader_positions.version+1, updated_at=excluded.updated_at
      returning version`.execute(this.database);
    return {
      ...locator,
      version: result.rows[0]?.version ?? 1,
      resolution: "exact" as const,
    };
  }

  async completeSection(
    userId: string,
    itemId: string,
    sectionId: string,
    correlationId: string,
  ): Promise<{ sectionId: string; completed: true }> {
    return this.database.transaction().execute(async (transaction) => {
      const owned = await sql<{
        id: string;
      }>`select s.id from sections s join library_items l on l.source_revision_id=s.source_revision_id where s.id=${sectionId} and l.id=${itemId} and l.owner_id=${userId}`.execute(
        transaction,
      );
      if (!owned.rows[0]) throw new AppError("library_item_not_found", 404);
      await sql`insert into section_completions (owner_id, section_id, completed_at) values (${userId}, ${sectionId}, ${this.timestamp()}) on conflict do nothing`.execute(
        transaction,
      );
      await this.recordEvent(
        transaction,
        userId,
        "section_completed",
        `section:${sectionId}`,
        { sectionId },
        correlationId,
      );
      return { sectionId, completed: true as const };
    });
  }

  async getOccurrenceContext(
    userId: string,
    itemId: string,
    occurrenceId: string,
  ): Promise<OccurrenceContextView> {
    const result = await sql<{
      occurrence_id: string;
      surface: string;
      lemma_id: string;
      lemma: string;
      part_of_speech: string;
      sentence_text: string;
      vocabulary_item_id: string | null;
      state: VocabularyState | null;
      version: number | null;
    }>`
      select o.id as occurrence_id, o.surface, o.lemma_id, le.normalized_lemma as lemma, le.part_of_speech,
        s.text as sentence_text, case when v.active then v.id else null end as vocabulary_item_id,
        case when v.active then v.state else null end as state, case when v.active then v.version else null end as version
      from occurrences o join lemmas le on le.id=o.lemma_id join sentences s on s.id=o.sentence_id
      join paragraphs p on p.id=o.paragraph_id join sections se on se.id=p.section_id
      join library_items li on li.source_revision_id=se.source_revision_id
      left join vocabulary_items v on v.owner_id=${userId} and v.lemma_id=o.lemma_id and v.language='fr'
      where o.id=${occurrenceId} and li.id=${itemId} and li.owner_id=${userId}
    `.execute(this.database);
    const row = result.rows[0];
    if (!row) throw new AppError("occurrence_not_found", 404);
    return {
      occurrence: {
        id: row.occurrence_id,
        surface: row.surface,
        lemmaId: row.lemma_id,
        lemma: row.lemma,
        partOfSpeech: row.part_of_speech,
      },
      sentence: row.sentence_text,
      vocabulary: row.vocabulary_item_id
        ? {
            id: row.vocabulary_item_id,
            state: row.state!,
            version: row.version!,
          }
        : null,
      meaning: fixtureMeaning(row.lemma),
    };
  }

  async changeVocabularyState(
    userId: string,
    occurrenceId: string,
    nextState: VocabularyState,
    idempotencyKey: string,
    correlationId: string,
  ): Promise<VocabularyMutationView> {
    if (
      !new Set([
        "new",
        "recognized",
        "familiar",
        "learned",
        "known",
        "ignored",
      ]).has(nextState)
    )
      throw new AppError("invalid_vocabulary_state", 422);
    const requestHash = this.hash(JSON.stringify({ occurrenceId, nextState }));
    return this.database.transaction().execute(async (transaction) => {
      const idempotent = await sql<{
        request_hash: string;
        response: unknown;
      }>`select request_hash, response from idempotency_records where owner_id=${userId} and operation='vocabulary_change' and key=${idempotencyKey}`.execute(
        transaction,
      );
      if (idempotent.rows[0]) {
        if (idempotent.rows[0].request_hash !== requestHash)
          throw new AppError("idempotency_key_reused", 409);
        return idempotent.rows[0].response as VocabularyMutationView;
      }
      const occurrence = await sql<{
        lemma_id: string;
      }>`select o.lemma_id from occurrences o join paragraphs p on p.id=o.paragraph_id join sections s on s.id=p.section_id join library_items l on l.source_revision_id=s.source_revision_id where o.id=${occurrenceId} and l.owner_id=${userId}`.execute(
        transaction,
      );
      if (!occurrence.rows[0]) throw new AppError("occurrence_not_found", 404);
      const current = await sql<{
        id: string;
        state: VocabularyState;
        active: boolean;
        version: number;
      }>`select id, state, active, version from vocabulary_items where owner_id=${userId} and language='fr' and lemma_id=${occurrence.rows[0].lemma_id} for update`.execute(
        transaction,
      );
      const vocabularyItemId = current.rows[0]?.id ?? this.id("voc");
      const previousState = current.rows[0]?.active
        ? current.rows[0].state
        : null;
      const version = current.rows[0] ? current.rows[0].version + 1 : 1;
      if (current.rows[0])
        await sql`update vocabulary_items set state=${nextState}::vocabulary_state, active=true, version=${version}, updated_at=${this.timestamp()} where id=${vocabularyItemId}`.execute(
          transaction,
        );
      else
        await sql`insert into vocabulary_items (id, owner_id, language, lemma_id, state, first_occurrence_id, updated_at) values (${vocabularyItemId}, ${userId}, 'fr', ${occurrence.rows[0].lemma_id}, ${nextState}::vocabulary_state, ${occurrenceId}, ${this.timestamp()})`.execute(
          transaction,
        );
      await sql`insert into vocabulary_occurrences (vocabulary_item_id, occurrence_id) values (${vocabularyItemId}, ${occurrenceId}) on conflict do nothing`.execute(
        transaction,
      );
      const changeId = this.id("chg");
      await sql`insert into vocabulary_changes (id, vocabulary_item_id, previous_state, next_state, resulting_version, created_at) values (${changeId}, ${vocabularyItemId}, ${previousState}::vocabulary_state, ${nextState}::vocabulary_state, ${version}, ${this.timestamp()})`.execute(
        transaction,
      );
      await this.recordEvent(
        transaction,
        userId,
        "vocabulary_state_changed",
        `change:${changeId}`,
        { vocabularyItemId },
        correlationId,
      );
      const response = {
        vocabularyItem: { id: vocabularyItemId, state: nextState, version },
        stateChangeId: changeId,
      };
      await this.storeIdempotency(
        transaction,
        userId,
        "vocabulary_change",
        idempotencyKey,
        requestHash,
        200,
        response,
      );
      return response;
    });
  }

  async undoVocabularyChange(
    userId: string,
    changeId: string,
    idempotencyKey: string,
    correlationId: string,
  ): Promise<VocabularyMutationView> {
    const requestHash = this.hash(JSON.stringify({ changeId }));
    return this.database.transaction().execute(async (transaction) => {
      const idempotent = await sql<{
        request_hash: string;
        response: unknown;
      }>`select request_hash, response from idempotency_records where owner_id=${userId} and operation='vocabulary_undo' and key=${idempotencyKey}`.execute(
        transaction,
      );
      if (idempotent.rows[0]) {
        if (idempotent.rows[0].request_hash !== requestHash)
          throw new AppError("idempotency_key_reused", 409);
        return idempotent.rows[0].response as VocabularyMutationView;
      }
      const result = await sql<{
        vocabulary_item_id: string;
        previous_state: VocabularyState | null;
        next_state: VocabularyState;
        resulting_version: number;
        undone_by_change_id: string | null;
        current_version: number;
        current_state: VocabularyState;
      }>`
        select c.vocabulary_item_id, c.previous_state, c.next_state, c.resulting_version, c.undone_by_change_id,
          v.version as current_version, v.state as current_state
        from vocabulary_changes c join vocabulary_items v on v.id=c.vocabulary_item_id
        where c.id=${changeId} and v.owner_id=${userId} for update of v, c
      `.execute(transaction);
      const change = result.rows[0];
      if (!change) throw new AppError("state_change_not_found", 404);
      if (
        !canUndo(
          change.resulting_version,
          change.current_version,
          Boolean(change.undone_by_change_id),
        )
      )
        throw new AppError("stale_state_change", 409);
      const version = change.current_version + 1;
      if (change.previous_state)
        await sql`update vocabulary_items set state=${change.previous_state}::vocabulary_state, active=true, version=${version}, updated_at=${this.timestamp()} where id=${change.vocabulary_item_id}`.execute(
          transaction,
        );
      else
        await sql`update vocabulary_items set active=false, version=${version}, updated_at=${this.timestamp()} where id=${change.vocabulary_item_id}`.execute(
          transaction,
        );
      const undoId = this.id("chg");
      await sql`insert into vocabulary_changes (id, vocabulary_item_id, previous_state, next_state, resulting_version, created_at) values (${undoId}, ${change.vocabulary_item_id}, ${change.current_state}::vocabulary_state, ${change.previous_state ?? change.current_state}::vocabulary_state, ${version}, ${this.timestamp()})`.execute(
        transaction,
      );
      await sql`update vocabulary_changes set undone_by_change_id=${undoId} where id=${changeId}`.execute(
        transaction,
      );
      await this.recordEvent(
        transaction,
        userId,
        "vocabulary_state_undone",
        `undo:${changeId}`,
        { vocabularyItemId: change.vocabulary_item_id },
        correlationId,
      );
      const response = {
        vocabularyItem: change.previous_state
          ? {
              id: change.vocabulary_item_id,
              state: change.previous_state,
              version,
            }
          : null,
        stateChangeId: undoId,
      };
      await this.storeIdempotency(
        transaction,
        userId,
        "vocabulary_undo",
        idempotencyKey,
        requestHash,
        200,
        response,
      );
      return response;
    });
  }

  async listVocabulary(userId: string): Promise<VocabularyListView> {
    const result = await sql<{
      id: string;
      state: VocabularyState;
      version: number;
      lemma_id: string;
      lemma: string;
      part_of_speech: string;
      surface: string;
      occurrence_id: string;
      library_item_id: string;
      sentence_text: string;
      occurrence_count: string;
    }>`
      select v.id, v.state, v.version, v.lemma_id, l.normalized_lemma as lemma, l.part_of_speech,
        o.surface, o.id as occurrence_id, li.id as library_item_id, s.text as sentence_text,
        (select count(*)::text from occurrences all_o join paragraphs all_p on all_p.id=all_o.paragraph_id
          join sections all_s on all_s.id=all_p.section_id join library_items all_li on all_li.source_revision_id=all_s.source_revision_id
          where all_o.lemma_id=v.lemma_id and all_li.owner_id=v.owner_id) as occurrence_count
      from vocabulary_items v join lemmas l on l.id=v.lemma_id join occurrences o on o.id=v.first_occurrence_id
      join sentences s on s.id=o.sentence_id join paragraphs p on p.id=o.paragraph_id
      join sections se on se.id=p.section_id join library_items li on li.source_revision_id=se.source_revision_id
      where v.owner_id=${userId} and v.active=true order by v.updated_at desc, v.id desc limit 20
    `.execute(this.database);
    return {
      items: result.rows.map((row) => ({
        id: row.id,
        state: row.state,
        version: row.version,
        lemmaId: row.lemma_id,
        lemma: row.lemma,
        partOfSpeech: row.part_of_speech,
        firstSurface: row.surface,
        firstOccurrenceId: row.occurrence_id,
        firstSentence: row.sentence_text,
        occurrenceCount: Number(row.occurrence_count),
        source: {
          libraryItemId: row.library_item_id,
          occurrenceId: row.occurrence_id,
        },
        meaning: fixtureMeaning(row.lemma),
      })),
      nextCursor: null,
    };
  }

  private async storeIdempotency(
    executor: Executor,
    userId: string,
    operation: string,
    key: string,
    requestHash: string,
    status: number,
    response: unknown,
  ): Promise<void> {
    await sql`insert into idempotency_records (owner_id, operation, key, request_hash, status, response, expires_at, created_at) values (${userId}, ${operation}, ${key}, ${requestHash}, ${status}, ${JSON.stringify(response)}::jsonb, ${new Date(this.now().getTime() + 86_400_000).toISOString()}, ${this.timestamp()})`.execute(
      executor,
    );
  }

  private async recordEvent(
    executor: Executor,
    userId: string,
    kind: string,
    dedupeKey: string,
    payload: object,
    correlationId: string,
  ): Promise<void> {
    const inserted = await sql<{
      id: string;
    }>`insert into learning_events (id, owner_id, kind, dedupe_key, payload, created_at) values (${this.id("evt")}, ${userId}, ${kind}, ${dedupeKey}, ${JSON.stringify(payload)}::jsonb, ${this.timestamp()}) on conflict (owner_id, dedupe_key) do nothing returning id`.execute(
      executor,
    );
    if (inserted.rows[0])
      await this.enqueue(
        executor,
        "project_progress",
        userId,
        userId,
        correlationId,
        {},
      );
  }

  private async projectProgress(userId: string): Promise<void> {
    await this.database.transaction().execute(async (transaction) => {
      const completed = await sql<{
        count: string;
      }>`select count(*)::text as count from section_completions where owner_id=${userId}`.execute(
        transaction,
      );
      const states = await sql<{
        state: VocabularyState;
        count: string;
      }>`select state, count(*)::text as count from vocabulary_items where owner_id=${userId} and active=true group by state`.execute(
        transaction,
      );
      const counts = Object.fromEntries(
        states.rows.map((row) => [row.state, Number(row.count)]),
      );
      await sql`insert into progress_summaries (owner_id, completed_sections, learning_count, known_count, ignored_count, computed_at)
        values (${userId}, ${Number(completed.rows[0]?.count ?? 0)}, ${(counts.new ?? 0) + (counts.recognized ?? 0) + (counts.familiar ?? 0) + (counts.learned ?? 0)}, ${counts.known ?? 0}, ${counts.ignored ?? 0}, ${this.timestamp()})
        on conflict (owner_id) do update set completed_sections=excluded.completed_sections, learning_count=excluded.learning_count, known_count=excluded.known_count, ignored_count=excluded.ignored_count, computed_at=excluded.computed_at`.execute(
        transaction,
      );
      await sql`update learning_events set projected_at=${this.timestamp()} where owner_id=${userId} and projected_at is null`.execute(
        transaction,
      );
    });
  }

  async getProgress(userId: string): Promise<ProgressSummaryView> {
    const result = await sql<{
      completed_sections: number;
      learning_count: number;
      known_count: number;
      ignored_count: number;
      computed_at: Date;
    }>`select completed_sections, learning_count, known_count, ignored_count, computed_at from progress_summaries where owner_id=${userId}`.execute(
      this.database,
    );
    const row = result.rows[0];
    return row
      ? {
          completedSections: row.completed_sections,
          vocabulary: {
            learning: row.learning_count,
            known: row.known_count,
            ignored: row.ignored_count,
          },
          computedAt: row.computed_at.toISOString(),
          disclaimer: "self_reported_states" as const,
        }
      : {
          completedSections: 0,
          vocabulary: { learning: 0, known: 0, ignored: 0 },
          computedAt: this.timestamp(),
          disclaimer: "self_reported_states" as const,
        };
  }
}
