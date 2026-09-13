import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import {
  recordedFrenchAnalysis,
  type LanguageAnalyzer,
} from "@readify/modules";
import { createDatabase } from "./database/client";
import { reconstructPdf } from "./pdf-reconstruction";
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
      "import-1",
      "req-1",
    );
    expect(created.status).toBe(202);
    const item = (created.body as { libraryItem: { id: string } }).libraryItem;
    const replay = await service.createPastedImport(
      owner.userId,
      source,
      "import-1",
      "req-1",
    );
    expect(replay).toEqual(created);
    const duplicate = await service.createPastedImport(
      owner.userId,
      source,
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
        "new",
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
      "new",
      "vocab-1",
      "req-3",
    )) as {
      vocabularyItem: { id: string; state: string };
      stateChangeId: string;
    };
    expect(changed.vocabularyItem.state).toBe("new");
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
    expect(repeated.every((token) => token.vocabularyState === "new")).toBe(
      true,
    );
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
      "recognized",
      "vocab-learning-2",
      "req-learning-2",
    );
    await service.changeVocabularyState(
      owner.userId,
      parler.id,
      "familiar",
      "vocab-learning-3",
      "req-learning-3",
    );
    await service.changeVocabularyState(
      owner.userId,
      parler.id,
      "learned",
      "vocab-learning-4",
      "req-learning-4",
    );
    expect(
      (await service.getOccurrenceContext(owner.userId, item.id, parler.id))
        .vocabulary?.state,
    ).toBe("learned");
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
        "race-1",
        "race-request-1",
      ),
      service.createPastedImport(
        owner.userId,
        text,
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
      "new",
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
    await expect(
      service.createPastedImport(
        owner.userId,
        english,
        "language-2",
        "req-language-2",
      ),
    ).rejects.toMatchObject({ code: "language_mismatch" });
    expect(
      (
        await sql<{
          count: string;
        }>`select count(*)::text as count from source_revisions where owner_id=${owner.userId}`.execute(
          database,
        )
      ).rows[0]?.count,
    ).toBe("0");
  });

  it("pages long Reader sections without truncating content and resumes around a semantic anchor", async () => {
    const owner = await account("reader-pagination@example.com");
    await service.putProfile(owner.userId, "fr", "B1");
    const text = Array.from(
      { length: 125 },
      (_, index) =>
        `Bonjour paragraphe ${index + 1}. Camille lit un livre français avec Élise.`,
    ).join("\n\n");
    const created = await service.createPastedImport(
      owner.userId,
      text,
      "reader-pagination-import",
      "reader-pagination-request",
    );
    const itemId = String(
      (created.body as { libraryItem: { id: string } }).libraryItem.id,
    );
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if ((await service.getLibraryItem(owner.userId, itemId)).readerAvailable)
        break;
      expect(await service.claimAndRunOne()).toBe(true);
    }

    const first = await service.getReader(owner.userId, itemId);
    expect(first.paragraphs).toHaveLength(50);
    expect(first.paragraphs[0]?.ordinal).toBe(0);
    expect(first.previousCursor).toBeNull();
    expect(first.nextCursor).not.toBeNull();
    const second = await service.getReader(
      owner.userId,
      itemId,
      first.section.id,
      first.nextCursor!,
    );
    const third = await service.getReader(
      owner.userId,
      itemId,
      first.section.id,
      second.nextCursor!,
    );
    expect(second.paragraphs).toHaveLength(50);
    expect(second.paragraphs[0]?.ordinal).toBe(50);
    expect(third.paragraphs).toHaveLength(25);
    expect(third.paragraphs.at(-1)?.ordinal).toBe(124);
    expect(third.nextCursor).toBeNull();
    expect(
      new Set(
        [...first.paragraphs, ...second.paragraphs, ...third.paragraphs].map(
          (paragraph) => paragraph.id,
        ),
      ).size,
    ).toBe(125);

    const anchor = second.paragraphs.find(
      (paragraph) => paragraph.ordinal === 75,
    )!;
    await service.saveReaderPosition(owner.userId, itemId, {
      sourceRevisionId: first.sourceRevisionId,
      sectionId: first.section.id,
      paragraphId: anchor.id,
    });
    const resumed = await service.getReader(owner.userId, itemId);
    expect(
      resumed.paragraphs.some((paragraph) => paragraph.id === anchor.id),
    ).toBe(true);
    expect(resumed.paragraphs[0]?.ordinal).toBe(65);
    expect(resumed.previousCursor).not.toBeNull();
    expect(resumed.nextCursor).not.toBeNull();
    await expect(
      service.getReader(owner.userId, itemId, first.section.id, "not-a-cursor"),
    ).rejects.toMatchObject({ code: "invalid_cursor", status: 400 });
  });

  it("persists reconstructed PDF hierarchy and precise provenance without retry duplication", async () => {
    const owner = await account("pdf-provenance@example.com");
    await service.putProfile(owner.userId, "fr", "B1");
    const pages = [
      {
        number: 1,
        width: 600,
        height: 800,
        rawText: "Première histoire\n\nÉlise ouvre la porte.",
        text: "Première histoire\n\nÉlise ouvre la porte.",
        qualityStatus: "native_good" as const,
        qualityScore: 1,
        blocks: [
          {
            id: "p1:b0",
            text: "Première histoire",
            bbox: [60, 80, 540, 110] as [number, number, number, number],
            lines: [
              {
                id: "p1:b0:l0",
                text: "Première histoire",
                bbox: [60, 80, 540, 110] as [number, number, number, number],
                sourceStartScalar: 0,
                sourceEndScalar: 17,
                spans: [
                  {
                    id: "p1:b0:l0:s0",
                    text: "Première histoire",
                    size: 20,
                    font: "Book-Bold",
                  },
                ],
              },
            ],
          },
          {
            id: "p1:b1",
            text: "Élise ouvre la porte.",
            bbox: [60, 150, 540, 180] as [number, number, number, number],
            lines: [
              {
                id: "p1:b1:l0",
                text: "Élise ouvre la porte.",
                bbox: [60, 150, 540, 180] as [number, number, number, number],
                sourceStartScalar: 19,
                sourceEndScalar: 40,
              },
            ],
          },
        ],
      },
      {
        number: 2,
        width: 600,
        height: 800,
        rawText: "Deuxième histoire\n\nCamille mange une pomme.",
        text: "Deuxième histoire\n\nCamille mange une pomme.",
        qualityStatus: "native_good" as const,
        qualityScore: 1,
        blocks: [
          {
            id: "p2:b0",
            text: "Deuxième histoire",
            bbox: [60, 80, 540, 110] as [number, number, number, number],
            lines: [
              {
                id: "p2:b0:l0",
                text: "Deuxième histoire",
                bbox: [60, 80, 540, 110] as [number, number, number, number],
                sourceStartScalar: 0,
                sourceEndScalar: 17,
                spans: [
                  {
                    id: "p2:b0:l0:s0",
                    text: "Deuxième histoire",
                    size: 20,
                    font: "Book-Bold",
                  },
                ],
              },
            ],
          },
          {
            id: "p2:b1",
            text: "Camille mange une pomme.",
            bbox: [60, 150, 540, 180] as [number, number, number, number],
            lines: [
              {
                id: "p2:b1:l0",
                text: "Camille mange une pomme.",
                bbox: [60, 150, 540, 180] as [number, number, number, number],
                sourceStartScalar: 19,
                sourceEndScalar: 43,
              },
            ],
          },
        ],
      },
    ];
    const document = reconstructPdf({
      pages,
      outline: [
        { level: 1, title: "Première histoire", pageNumber: 1 },
        { level: 1, title: "Deuxième histoire", pageNumber: 2 },
      ],
      extractor: { name: "fixture", version: "1" },
    });
    const created = await service.createFileImport(
      owner.userId,
      "pdf",
      document.chapters,
      "pdf-canonical-import",
      "pdf-canonical-request",
      4_096,
    );
    const item = (created.body as { libraryItem: { id: string } }).libraryItem;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (
        (await service.getLibraryItem(owner.userId, item.id)).processing
          .overall === "ready"
      )
        break;
      expect(await service.claimAndRunOne()).toBe(true);
    }
    const index = await service.getBookIndex(owner.userId, item.id);
    expect(index.chapters.map((chapter) => chapter.title)).toEqual([
      "Première histoire",
      "Deuxième histoire",
    ]);
    const counts = await sql<{
      sections: string;
      paragraphs: string;
      anchors: string;
      occurrence_anchors: string;
    }>`select
      (select count(*) from sections s join library_items l on l.source_revision_id=s.source_revision_id where l.id=${item.id})::text as sections,
      (select count(*) from paragraphs p join sections s on s.id=p.section_id join library_items l on l.source_revision_id=s.source_revision_id where l.id=${item.id})::text as paragraphs,
      (select count(*) from content_source_anchors a where a.entity_type in ('section','paragraph','sentence'))::text as anchors,
      (select count(*) from content_source_anchors a where a.entity_type='occurrence')::text as occurrence_anchors
    `.execute(database);
    expect(counts.rows[0]).toMatchObject({ sections: "2", paragraphs: "2" });
    expect(Number(counts.rows[0]?.anchors)).toBeGreaterThanOrEqual(6);
    expect(Number(counts.rows[0]?.occurrence_anchors)).toBeGreaterThan(0);

    const importRow = await sql<{
      import_id: string;
    }>`select import_id from library_items where id=${item.id}`.execute(
      database,
    );
    const retried = await sql<{
      id: string;
    }>`update jobs set status='queued', available_at='2020-01-01T00:00:00Z' where subject_id=${importRow.rows[0]!.import_id} and kind='prepare_text' returning id`.execute(
      database,
    );
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const state = await sql<{
        status: string;
      }>`select status from jobs where id=${retried.rows[0]!.id}`.execute(
        database,
      );
      if (state.rows[0]?.status === "succeeded") break;
      expect(await service.claimAndRunOne()).toBe(true);
    }
    const afterRetry = await sql<{
      count: string;
    }>`select count(*)::text as count from sections s join library_items l on l.source_revision_id=s.source_revision_id where l.id=${item.id}`.execute(
      database,
    );
    expect(afterRetry.rows[0]?.count).toBe("2");
    const duplicateAnalysisJobs = await sql<{
      count: string;
    }>`select count(*)::text as count from jobs where subject_id=${importRow.rows[0]!.import_id} and kind='analyze_language'`.execute(
      database,
    );
    expect(duplicateAnalysisJobs.rows[0]?.count).toBe("1");
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
