import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import {
  recordedFrenchAnalysis,
  type LanguageAnalyzer,
} from "@readify/modules";
import { createDatabase } from "./database/client";
import { ReadifyService } from "./service";

const database = createDatabase();
let sequence = 0;
const nextId = (prefix: string) =>
  `${prefix}_${String(++sequence).padStart(5, "0")}`;
const service = new ReadifyService(
  database,
  () => new Date("2026-09-01T12:00:00.000Z"),
  nextId,
);

class SwitchableAnalyzer implements LanguageAnalyzer {
  failing = true;

  async analyze(text: string) {
    if (this.failing) throw new Error("language_analyzer_timeout");
    return {
      provider: "recorded",
      providerVersion: "1",
      tokens: recordedFrenchAnalysis(text),
    };
  }
}

beforeAll(async () => {
  await sql`truncate table idempotency_records, progress_summaries, learning_events, vocabulary_changes,
    vocabulary_occurrences, vocabulary_items, section_completions, reader_positions, occurrences, lemmas,
    sentences, paragraphs, sections, jobs, library_items, import_workflows, source_revisions,
    learning_profiles, sessions, auth_proofs, users cascade`.execute(database);
});

afterAll(async () => service.close());

async function account(email: string) {
  const requested = await service.requestEmailProof(email, "/library");
  const session = await service.consumeEmailProof(requested.proof);
  return session.identity;
}

describe("first vertical slice", () => {
  it("enforces one-time proofs and create-only French profile", async () => {
    const requested = await service.requestEmailProof(
      "Learner@example.com",
      "/library",
    );
    const session = await service.consumeEmailProof(requested.proof);
    expect(session.identity.email).toBe("learner@example.com");
    await expect(
      service.consumeEmailProof(requested.proof),
    ).rejects.toMatchObject({ code: "invalid_or_expired_proof" });
    const expired = await service.requestEmailProof(
      "expired@example.com",
      "/library",
    );
    await sql`update auth_proofs set expires_at='2020-01-01T00:00:00Z' where proof_hash is not null and consumed_at is null`.execute(
      database,
    );
    await expect(
      service.consumeEmailProof(expired.proof),
    ).rejects.toMatchObject({ code: "invalid_or_expired_proof" });
    await expect(
      service.putProfile(session.identity.userId, "en", "B1"),
    ).rejects.toMatchObject({ code: "unsupported_target_language" });
    await expect(
      service.requestEmailProof("learner@example.com", "/reader/item"),
    ).rejects.toMatchObject({ code: "invalid_return_path" });
    expect(
      await service.putProfile(session.identity.userId, "fr", "B1"),
    ).toEqual({ targetLanguage: "fr", startingLevel: "B1" });
    await expect(
      service.putProfile(session.identity.userId, "fr", "B2"),
    ).rejects.toMatchObject({ code: "profile_already_created" });
  });

  it("runs pasted text through durable processing, Reader, Vocabulary, resume and Progress", async () => {
    const owner = await account("owner@example.com");
    const stranger = await account("stranger@example.com");
    await service.putProfile(owner.userId, "fr", "A2");
    await service.putProfile(stranger.userId, "fr", "A2");
    const source =
      "\r\n\r\nBonjour au marché 🥐. Camille mange une pomme, choisit du pain et choisira un fruit.\r\n\r\nHier, ils mangeaient du pain et parlaient avec Nora.\r\n";
    const created = await service.createPastedImport(
      owner.userId,
      source,
      false,
      "import-1",
      "req-1",
    );
    expect(created.status).toBe(202);
    const item = (created.body as { libraryItem: { id: string } }).libraryItem;
    const replay = await service.createPastedImport(
      owner.userId,
      source,
      false,
      "import-1",
      "req-1",
    );
    expect(replay).toEqual(created);
    const duplicate = await service.createPastedImport(
      owner.userId,
      source,
      false,
      "import-2",
      "req-2",
    );
    expect(duplicate.status).toBe(200);
    await expect(
      service.getLibraryItem(stranger.userId, item.id),
    ).rejects.toMatchObject({ status: 404 });
    expect(await service.claimAndRunOne()).toBe(true);
    expect(
      (await service.getLibraryItem(owner.userId, item.id)).readerAvailable,
    ).toBe(true);
    expect(await service.claimAndRunOne()).toBe(true);
    expect(
      (await service.getLibraryItem(owner.userId, item.id)).processing.overall,
    ).toBe("ready");
    const reader = await service.getReader(owner.userId, item.id);
    expect(reader.paragraphs).toHaveLength(2);
    expect(reader.paragraphs[0]?.text).toContain("🥐");
    expect((await service.listVocabulary(owner.userId)).items).toHaveLength(0);
    expect(await service.getProgress(owner.userId)).toMatchObject({
      vocabulary: { learning: 0, known: 0, ignored: 0 },
    });
    expect(
      (await service.listLibrary(stranger.userId)).items.some(
        (candidate) => candidate.id === item.id,
      ),
    ).toBe(false);
    await expect(
      service.getReader(stranger.userId, item.id),
    ).rejects.toMatchObject({ status: 404 });
    const occurrence = reader.paragraphs
      .flatMap((paragraph) => paragraph.occurrences)
      .find((token) => token.surface.toLocaleLowerCase("fr") === "mange");
    expect(occurrence).toBeTruthy();
    await expect(
      service.saveReaderPosition(stranger.userId, item.id, {
        sourceRevisionId: reader.sourceRevisionId as string,
        sectionId: reader.section.id,
        paragraphId: reader.paragraphs[0]!.id,
      }),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      service.completeSection(
        stranger.userId,
        item.id,
        reader.section.id,
        "stranger-complete",
      ),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      service.changeVocabularyState(
        stranger.userId,
        occurrence!.id,
        "learning",
        "stranger-change",
        "stranger-change-request",
      ),
    ).rejects.toMatchObject({ status: 404 });
    const context = await service.getOccurrenceContext(
      owner.userId,
      item.id,
      occurrence!.id,
    );
    expect(context.meaning).toMatchObject({
      availability: "available",
      meaning: "yemek",
    });
    expect(context.vocabulary).toBeNull();
    const changed = (await service.changeVocabularyState(
      owner.userId,
      occurrence!.id,
      "learning",
      "vocab-1",
      "req-3",
    )) as {
      vocabularyItem: { id: string; state: string };
      stateChangeId: string;
    };
    expect(changed.vocabularyItem.state).toBe("learning");
    const vocabulary = await service.listVocabulary(owner.userId);
    expect(vocabulary.items).toHaveLength(1);
    expect(vocabulary.items[0]).toMatchObject({
      lemma: "manger",
      firstSentence: expect.stringContaining("mange"),
      meaning: { availability: "available", meaning: "yemek" },
      source: { libraryItemId: item.id },
    });
    expect(vocabulary.items[0]!.occurrenceCount).toBeGreaterThan(1);
    const repeated = (await service.getReader(owner.userId, item.id)).paragraphs
      .flatMap((paragraph) => paragraph.occurrences)
      .filter((token) => token.lemmaId === occurrence!.lemmaId);
    expect(repeated.length).toBeGreaterThan(1);
    expect(
      repeated.every((token) => token.vocabularyState === "learning"),
    ).toBe(true);
    const parler = reader.paragraphs
      .flatMap((paragraph) => paragraph.occurrences)
      .find((token) => token.surface === "parlaient")!;
    const choisir = reader.paragraphs
      .flatMap((paragraph) => paragraph.occurrences)
      .find((token) => token.surface === "choisit");
    await service.changeVocabularyState(
      owner.userId,
      choisir!.id,
      "known",
      "vocab-known",
      "req-known",
    );
    const knownOccurrences = (
      await service.getReader(owner.userId, item.id)
    ).paragraphs
      .flatMap((paragraph) => paragraph.occurrences)
      .filter((token) => token.lemmaId === choisir!.lemmaId);
    expect(knownOccurrences).toHaveLength(2);
    expect(
      knownOccurrences.every((token) => token.vocabularyState === "known"),
    ).toBe(true);
    await service.changeVocabularyState(
      owner.userId,
      parler.id,
      "learning",
      "vocab-learning-2",
      "req-learning-2",
    );
    const nora = reader.paragraphs
      .flatMap((paragraph) => paragraph.occurrences)
      .find((token) => token.surface === "Nora");
    expect(
      (await service.getOccurrenceContext(owner.userId, item.id, nora!.id))
        .meaning.availability,
    ).toBe("unavailable");
    await expect(
      service.getOccurrenceContext(stranger.userId, item.id, occurrence!.id),
    ).rejects.toMatchObject({ status: 404 });
    await service.saveReaderPosition(owner.userId, item.id, {
      sourceRevisionId: reader.sourceRevisionId as string,
      sectionId: reader.section.id,
      paragraphId: reader.paragraphs[1]!.id,
      sentenceId: reader.paragraphs[1]!.sentences[0]!.id,
    });
    expect(
      (await service.getReader(owner.userId, item.id)).savedPosition?.anchor
        .paragraphId,
    ).toBe(reader.paragraphs[1]!.id);
    await service.completeSection(
      owner.userId,
      item.id,
      reader.section.id,
      "req-4",
    );
    for (let pending = 0; pending < 10; pending += 1)
      if (!(await service.claimAndRunOne())) break;
    const progress = await service.getProgress(owner.userId);
    expect(progress).toMatchObject({
      completedSections: 1,
      vocabulary: { learning: 2, known: 1 },
      disclaimer: "self_reported_states",
    });
    expect(progress).not.toHaveProperty("recall");
    const undone = (await service.undoVocabularyChange(
      owner.userId,
      changed.stateChangeId,
      "undo-1",
      "req-5",
    )) as { vocabularyItem: null };
    expect(undone.vocabularyItem).toBeNull();
    const afterUndo = (await service.listVocabulary(owner.userId)).items;
    expect(afterUndo).toHaveLength(2);
    expect(afterUndo.some((entry) => entry.lemma === "manger")).toBe(false);
  });

  it("serializes duplicate races, recovers expired leases, and rejects stale undo", async () => {
    const owner = await account("recovery@example.com");
    await service.putProfile(owner.userId, "fr", "B1");
    const text =
      "Camille va au marché avec Nora et parle avec le vendeur. Elle mange une pomme et choisit du pain. ".repeat(
        2,
      );
    const [first, second] = await Promise.all([
      service.createPastedImport(
        owner.userId,
        text,
        false,
        "race-1",
        "race-request-1",
      ),
      service.createPastedImport(
        owner.userId,
        text,
        false,
        "race-2",
        "race-request-2",
      ),
    ]);
    expect([first.status, second.status].sort()).toEqual([200, 202]);
    await sql`update jobs set status='running', lease_until='2020-01-01T00:00:00Z' where owner_id=${owner.userId} and status='queued'`.execute(
      database,
    );
    const library = await service.listLibrary(owner.userId);
    for (let attempt = 0; attempt < 10; attempt += 1) {
      if (
        (
          await service.getLibraryItem(
            owner.userId,
            String(library.items[0]!.id),
          )
        ).processing.overall === "ready"
      )
        break;
      expect(await service.claimAndRunOne()).toBe(true);
    }
    const reader = await service.getReader(
      owner.userId,
      String(library.items[0]!.id),
    );
    const repeatedOccurrences = reader.paragraphs
      .flatMap((paragraph) => paragraph.occurrences)
      .filter((token) => token.surface === "mange");
    expect(repeatedOccurrences).toHaveLength(2);
    const occurrence = repeatedOccurrences[0]!;
    const firstChange = (await service.changeVocabularyState(
      owner.userId,
      occurrence.id,
      "learning",
      "stale-1",
      "req-stale-1",
    )) as { stateChangeId: string };
    await service.changeVocabularyState(
      owner.userId,
      repeatedOccurrences[1]!.id,
      "known",
      "stale-2",
      "req-stale-2",
    );
    expect((await service.listVocabulary(owner.userId)).items).toHaveLength(1);
    const associated = await sql<{
      count: string;
    }>`select count(*)::text as count from vocabulary_occurrences vo join vocabulary_items v on v.id=vo.vocabulary_item_id where v.owner_id=${owner.userId}`.execute(
      database,
    );
    expect(associated.rows[0]?.count).toBe("2");
    await expect(
      service.undoVocabularyChange(
        owner.userId,
        firstChange.stateChangeId,
        "stale-undo",
        "req-stale-3",
      ),
    ).rejects.toMatchObject({ code: "stale_state_change", status: 409 });
  });

  it("does not persist a policy-qualified language mismatch", async () => {
    const owner = await account("language@example.com");
    await service.putProfile(owner.userId, "fr", "A2");
    const english =
      "This is the story of a learner and the words that are read with care from the first page. ".repeat(
        3,
      );
    await expect(
      service.createPastedImport(
        owner.userId,
        english,
        false,
        "language-1",
        "req-language",
      ),
    ).rejects.toMatchObject({ code: "language_mismatch" });
    const counts = await sql<{
      count: string;
    }>`select count(*)::text as count from source_revisions where owner_id=${owner.userId}`.execute(
      database,
    );
    expect(counts.rows[0]?.count).toBe("0");
    const accepted = await service.createPastedImport(
      owner.userId,
      english,
      true,
      "language-accepted",
      "req-language-accepted",
    );
    expect(accepted.status).toBe(202);
    const acknowledgment = await sql<{
      accepted: boolean;
    }>`select language_mismatch_accepted as accepted from source_revisions where owner_id=${owner.userId}`.execute(
      database,
    );
    expect(acknowledgment.rows[0]?.accepted).toBe(true);
  });

  it("keeps Reader available after analyzer exhaustion and supports a targeted retry", async () => {
    const analyzer = new SwitchableAnalyzer();
    const resilientService = new ReadifyService(
      database,
      () => new Date("2026-09-01T12:00:00.000Z"),
      nextId,
      undefined,
      analyzer,
    );
    const owner = await account("degraded@example.com");
    await resilientService.putProfile(owner.userId, "fr", "B1");
    const created = await resilientService.createPastedImport(
      owner.userId,
      "Camille mange une pomme avec Nora. Elle parle avec le vendeur et choisit du pain au marché.",
      false,
      "degraded-import",
      "degraded-request",
    );
    const itemId = String(
      (created.body as { libraryItem: { id: string } }).libraryItem.id,
    );

    for (let attempt = 0; attempt < 12; attempt += 1) {
      await sql`update jobs set available_at='2026-09-01T12:00:00Z' where owner_id=${owner.userId} and kind='analyze_language' and status='queued'`.execute(
        database,
      );
      expect(await resilientService.claimAndRunOne()).toBe(true);
      if (
        (await resilientService.getLibraryItem(owner.userId, itemId)).processing
          .overall === "ready_degraded"
      )
        break;
    }

    const degraded = await resilientService.getLibraryItem(
      owner.userId,
      itemId,
    );
    expect(degraded).toMatchObject({
      readerAvailable: true,
      processing: {
        overall: "ready_degraded",
        capabilities: { text: "ready", wordTools: "failed" },
        retryableCapabilities: ["word_tools"],
      },
    });
    expect(
      (await resilientService.getReader(owner.userId, itemId)).paragraphs,
    ).not.toHaveLength(0);

    analyzer.failing = false;
    await resilientService.retryCapability(
      owner.userId,
      itemId,
      "word_tools",
      "degraded-retry",
      "degraded-retry-request",
    );
    expect(await resilientService.claimAndRunOne()).toBe(true);
    expect(
      (await resilientService.getLibraryItem(owner.userId, itemId)).processing,
    ).toMatchObject({
      overall: "ready",
      capabilities: { wordTools: "ready" },
    });
  });
});
