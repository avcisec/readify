"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppNav } from "../../../components/app-nav";
import {
  ApiProblem,
  api,
  idempotencyKey,
  turkishProblem,
} from "../../../lib/api";

type State =
  "new" | "recognized" | "familiar" | "learned" | "known" | "ignored";
type Occurrence = {
  id: string;
  sentenceId: string;
  lemmaId: string;
  surface: string;
  startScalar: number;
  endScalar: number;
  vocabularyState: State | null;
};
type Paragraph = {
  id: string;
  ordinal: number;
  text: string;
  sentences: Array<{ id: string }>;
  occurrences: Occurrence[];
};
type Reader = {
  libraryItem: { id: string; title: string };
  sourceRevisionId: string;
  section: { id: string; completed: boolean };
  paragraphs: Paragraph[];
  savedPosition: null | { anchor: { paragraphId: string } };
  processing: { capabilities: { wordTools: string } };
};
type Context = {
  occurrence: {
    id: string;
    surface: string;
    lemma: string;
    partOfSpeech: string;
  };
  sentence: string;
  vocabulary: null | { id: string; state: State; version: number };
  meaning:
    | {
        availability: "available";
        meaning: string;
        source: string;
        datasetVersion: string;
      }
    | {
        availability: "unavailable";
        source: string;
        datasetVersion: string;
        reason: "not_in_fixture" | "temporarily_unavailable";
        retryable: boolean;
      };
};
type Change = {
  vocabularyItem: null | { id: string; state: State; version: number };
  stateChangeId: string;
};
type PositionAnchor = {
  paragraphId: string;
  sentenceId?: string | null;
};
const stateLabels = {
  new: "1 · New",
  recognized: "2 · Recognised",
  familiar: "3 · Familiar",
  learned: "4 · Learned",
  known: "Known",
  ignored: "Ignore",
};
const learningStages = [
  { state: "new", key: "1", number: "1" },
  { state: "recognized", key: "2", number: "2" },
  { state: "familiar", key: "3", number: "3" },
  { state: "learned", key: "4", number: "4" },
] as const;

export default function ReaderPage() {
  const { libraryItemId } = useParams<{ libraryItemId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get("sectionId");
  const [reader, setReader] = useState<Reader>();
  const [context, setContext] = useState<Context>();
  const [message, setMessage] = useState<string>();
  const [lastChange, setLastChange] = useState<string>();
  const [stateBusy, setStateBusy] = useState(false);
  const panelHeading = useRef<HTMLHeadingElement>(null);
  const activeToken = useRef<HTMLButtonElement | null>(null);
  const trackingReady = useRef(false);
  const observedParagraph = useRef<string | undefined>(undefined);
  const pendingPosition = useRef<PositionAnchor | undefined>(undefined);
  const positionSave = useRef<Promise<void> | null>(null);
  const positionTimer = useRef<number | undefined>(undefined);
  const load = useCallback(async () => {
    try {
      setReader(
        await api<Reader>(
          `/api/v1/library-items/${libraryItemId}/reader${sectionId ? `?sectionId=${encodeURIComponent(sectionId)}` : ""}`,
        ),
      );
    } catch (error) {
      if (error instanceof ApiProblem && error.status === 401)
        router.replace("/sign-in");
      else
        setMessage(
          turkishProblem(
            error instanceof Error ? error.message : "request_failed",
          ),
        );
    }
  }, [libraryItemId, router, sectionId]);
  useEffect(() => {
    void load();
  }, [load]);
  const flushPosition = useCallback(
    async (keepalive = false) => {
      if (!reader || positionSave.current || !pendingPosition.current) return;
      const anchor = pendingPosition.current;
      pendingPosition.current = undefined;
      const request = api<void>(
        `/api/v1/library-items/${libraryItemId}/reader-position`,
        {
          method: "PUT",
          keepalive,
          body: JSON.stringify({
            sourceRevisionId: reader.sourceRevisionId,
            anchor: {
              sectionId: reader.section.id,
              paragraphId: anchor.paragraphId,
              sentenceId: anchor.sentenceId ?? null,
            },
          }),
        },
      )
        .catch(() => {
          pendingPosition.current ??= anchor;
        })
        .finally(() => {
          positionSave.current = null;
          if (pendingPosition.current && !keepalive)
            window.setTimeout(() => void flushPosition(), 0);
        });
      positionSave.current = request;
      await request;
    },
    [libraryItemId, reader],
  );
  const queuePosition = useCallback(
    (anchor: PositionAnchor, immediate = false) => {
      pendingPosition.current = anchor;
      window.clearTimeout(positionTimer.current);
      if (immediate) void flushPosition();
      else
        positionTimer.current = window.setTimeout(
          () => void flushPosition(),
          750,
        );
    },
    [flushPosition],
  );
  useEffect(() => {
    if (!reader) return;
    trackingReady.current = false;
    const hashTarget = window.location.hash.startsWith("#occurrence-")
      ? document.getElementById(window.location.hash.slice(1))
      : null;
    const target =
      hashTarget ??
      (reader.savedPosition
        ? document.getElementById(reader.savedPosition.anchor.paragraphId)
        : null);
    target?.scrollIntoView({ block: "center" });
    if (hashTarget instanceof HTMLElement) hashTarget.focus();
    observedParagraph.current =
      target?.closest(".reader-paragraph")?.id ??
      reader.savedPosition?.anchor.paragraphId ??
      reader.paragraphs[0]?.id;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        trackingReady.current = true;
      });
    });
    return () => {
      trackingReady.current = false;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [reader]);
  useEffect(() => {
    if (!reader) return;
    let frame = 0;
    function observePosition() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (!trackingReady.current) return;
        const paragraphs = [
          ...document.querySelectorAll<HTMLElement>(".reader-paragraph"),
        ];
        const readingLine = window.innerHeight * 0.35;
        let current = paragraphs[0];
        for (const paragraph of paragraphs) {
          if (paragraph.getBoundingClientRect().top > readingLine) break;
          current = paragraph;
        }
        if (!current || observedParagraph.current === current.id) return;
        observedParagraph.current = current.id;
        queuePosition({ paragraphId: current.id });
      });
    }
    function flushPending() {
      window.clearTimeout(positionTimer.current);
      void flushPosition(true);
    }
    function visibilityChanged() {
      if (document.visibilityState === "hidden") flushPending();
    }
    window.addEventListener("scroll", observePosition, { passive: true });
    window.addEventListener("resize", observePosition);
    window.addEventListener("pagehide", flushPending);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(positionTimer.current);
      window.removeEventListener("scroll", observePosition);
      window.removeEventListener("resize", observePosition);
      window.removeEventListener("pagehide", flushPending);
      document.removeEventListener("visibilitychange", visibilityChanged);
      flushPending();
    };
  }, [flushPosition, queuePosition, reader]);
  useEffect(() => {
    if (!context) return;
    const currentContext = context;
    function escapeContext(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        const returnTarget = activeToken.current;
        setContext(undefined);
        setLastChange(undefined);
        window.setTimeout(() => returnTarget?.focus(), 0);
        return;
      }
      const target = event.target;
      if (
        stateBusy ||
        event.repeat ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        (target instanceof HTMLElement &&
          (target.isContentEditable ||
            ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)))
      )
        return;
      const shortcutStates: Record<string, State> = {
        "1": "new",
        "2": "recognized",
        "3": "familiar",
        "4": "learned",
        q: "ignored",
        e: "known",
      };
      const state = shortcutStates[event.key.toLocaleLowerCase("tr")];
      if (!state || currentContext.vocabulary?.state === state) return;
      event.preventDefault();
      void changeState(state);
    }
    document.addEventListener("keydown", escapeContext);
    return () => document.removeEventListener("keydown", escapeContext);
  }, [context, stateBusy]);
  useEffect(() => {
    if (!context) return;
    const frame = window.requestAnimationFrame(() =>
      panelHeading.current?.focus(),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [context?.occurrence.id]);

  async function openContext(
    occurrence: Occurrence,
    paragraph: Paragraph,
    target: HTMLButtonElement,
  ) {
    activeToken.current = target;
    setContext(undefined);
    setMessage("Kelime bilgisi yükleniyor…");
    try {
      const result = await api<Context>(
        `/api/v1/library-items/${libraryItemId}/occurrences/${occurrence.id}/context`,
      );
      setContext(result);
      setLastChange(undefined);
      setMessage(undefined);
      queuePosition(
        { paragraphId: paragraph.id, sentenceId: occurrence.sentenceId },
        true,
      );
    } catch (error) {
      setMessage(
        turkishProblem(
          error instanceof Error ? error.message : "request_failed",
        ),
      );
    }
  }
  async function retryMeaning() {
    if (!context) return;
    setMessage("Anlam yeniden deneniyor…");
    try {
      setContext(
        await api<Context>(
          `/api/v1/library-items/${libraryItemId}/occurrences/${context.occurrence.id}/context`,
        ),
      );
      setMessage(undefined);
    } catch (error) {
      setMessage(
        turkishProblem(
          error instanceof Error ? error.message : "request_failed",
        ),
      );
    }
  }
  function closeContext() {
    const returnTarget = activeToken.current;
    setContext(undefined);
    setLastChange(undefined);
    window.setTimeout(() => returnTarget?.focus(), 0);
  }
  async function changeState(state: State) {
    if (!context || stateBusy || context.vocabulary?.state === state) return;
    setStateBusy(true);
    try {
      const change = await api<Change>("/api/v1/vocabulary-state-changes", {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey() },
        body: JSON.stringify({ occurrenceId: context.occurrence.id, state }),
      });
      setLastChange(change.stateChangeId);
      setContext({ ...context, vocabulary: change.vocabularyItem });
      setMessage(`${stateLabels[state]} olarak kaydedildi.`);
      await load();
    } catch (error) {
      setMessage(
        turkishProblem(
          error instanceof Error ? error.message : "request_failed",
        ),
      );
    } finally {
      setStateBusy(false);
    }
  }
  async function undo() {
    if (!lastChange || !context) return;
    try {
      const change = await api<Change>(
        `/api/v1/vocabulary-state-changes/${lastChange}/undo`,
        { method: "POST", headers: { "Idempotency-Key": idempotencyKey() } },
      );
      setContext({ ...context, vocabulary: change.vocabularyItem });
      setLastChange(undefined);
      setMessage("Son kelime değişikliği geri alındı.");
      await load();
    } catch (error) {
      setMessage(
        turkishProblem(
          error instanceof Error ? error.message : "request_failed",
        ),
      );
    }
  }
  async function complete() {
    if (!reader) return;
    await api(
      `/api/v1/library-items/${libraryItemId}/sections/${reader.section.id}/completion`,
      { method: "PUT" },
    );
    setReader({ ...reader, section: { ...reader.section, completed: true } });
    setMessage("Bölüm tamamlandı olarak işaretlendi.");
  }
  function tokenKeys(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const tokens = [
      ...document.querySelectorAll<HTMLButtonElement>(".reader-token"),
    ];
    const index = tokens.indexOf(event.currentTarget);
    const next = tokens[index + (event.key === "ArrowRight" ? 1 : -1)];
    if (next) {
      event.preventDefault();
      event.currentTarget.tabIndex = -1;
      next.tabIndex = 0;
      next.focus();
    }
  }

  if (!reader)
    return (
      <div className="reader-shell">
        <AppNav />
        <ReaderHeader />
        <main className="reader-loading">
          <p aria-live="polite">{message ?? "Okuyucu yükleniyor…"}</p>
        </main>
      </div>
    );
  return (
    <div className="reader-shell">
      <AppNav />
      <ReaderHeader title={reader.libraryItem.title} />
      <main className={`reader-layout ${context ? "context-open" : ""}`}>
        <article className="reader-document" aria-labelledby="reader-title">
          <header>
            <p className="eyebrow">Fransızca · Sayfa okuyucu</p>
            <h1 id="reader-title">{reader.libraryItem.title}</h1>
            <p className="reader-meta">
              {reader.section.completed
                ? "Bölüm tamamlandı"
                : "Okuma konumun ilerledikçe otomatik saklanır."}
            </p>
          </header>
          {reader.processing.capabilities.wordTools !== "ready" ? (
            <p className="reader-notice" role="status">
              Metin okunabilir; kelime araçları şu an kullanılamıyor.
            </p>
          ) : null}
          {reader.paragraphs.map((paragraph) => (
            <ReaderParagraph
              key={paragraph.id}
              paragraph={paragraph}
              onToken={openContext}
              onKeyDown={tokenKeys}
              initialTabStop={paragraph === reader.paragraphs[0]}
            />
          ))}
          <footer className="reader-footer">
            <div>
              <span className="eyebrow">Okuma durumu</span>
              <strong>
                {reader.section.completed
                  ? "Bölüm tamamlandı"
                  : "Okumaya devam ediyorsun"}
              </strong>
            </div>
            <button
              onClick={() => void complete()}
              disabled={reader.section.completed}
            >
              {reader.section.completed ? "Tamamlandı" : "Bölümü tamamla"}
            </button>
          </footer>
        </article>
        {context ? (
          <aside className="context-panel" aria-label="Kelime bağlamı">
            <div className="sheet-handle" aria-hidden="true" />
            <button
              className="close-button"
              aria-label="Kelime panelini kapat"
              onClick={closeContext}
            >
              ×
            </button>
            <p className="eyebrow">Kelime bağlamı</p>
            <h2 ref={panelHeading} tabIndex={-1}>
              {context.occurrence.surface}
            </h2>
            <div className="lemma-row">
              <span>
                <small>Metindeki biçim</small>
                <strong>{context.occurrence.surface}</strong>
              </span>
              <span aria-hidden="true">→</span>
              <span>
                <small>Lemma</small>
                <strong>{context.occurrence.lemma} (lemma)</strong>
              </span>
            </div>
            {context.meaning.availability === "available" ? (
              <section className="meaning-card" aria-label="Türkçe anlam">
                <span className="eyebrow">Türkçe:</span>
                <p className="meaning">{context.meaning.meaning}</p>
                <small>
                  Kaynak: {context.meaning.source} ·{" "}
                  {context.meaning.datasetVersion}
                </small>
              </section>
            ) : (
              <section className="meaning-card unavailable">
                <p>
                  {context.meaning.reason === "not_in_fixture"
                    ? "Bu kelime sınırlı geliştirme sözlüğünde yok. Gerçek Fransızca–Türkçe sözlük henüz bağlı değil."
                    : "Anlam kaynağına şu an ulaşılamıyor."}
                </p>
                {context.meaning.retryable ? (
                  <button
                    className="secondary"
                    onClick={() => void retryMeaning()}
                  >
                    Anlamı yeniden dene
                  </button>
                ) : null}
              </section>
            )}
            <div className="source-context">
              <span className="eyebrow">Metindeki bağlam</span>
              <blockquote>{context.sentence}</blockquote>
            </div>
            <fieldset>
              <legend>Kelime durumu</legend>
              <div className="state-actions" aria-label="Kelime durumu seç">
                <button
                  className="state-icon-action"
                  aria-label="Ignore · Q"
                  aria-keyshortcuts="Q"
                  aria-pressed={context.vocabulary?.state === "ignored"}
                  disabled={stateBusy}
                  onClick={() => void changeState("ignored")}
                >
                  <TrashIcon />
                </button>
                {learningStages.map(({ state, key, number }) => (
                  <button
                    key={state}
                    aria-label={stateLabels[state]}
                    aria-keyshortcuts={key}
                    aria-pressed={context.vocabulary?.state === state}
                    disabled={stateBusy}
                    onClick={() => void changeState(state)}
                  >
                    {number}
                  </button>
                ))}
                <button
                  className="state-icon-action state-known-action"
                  aria-label="Known · E"
                  aria-keyshortcuts="E"
                  aria-pressed={context.vocabulary?.state === "known"}
                  disabled={stateBusy}
                  onClick={() => void changeState("known")}
                >
                  <CheckIcon />
                </button>
              </div>
              <p className="state-scale-help">
                1 New · 2 Recognised · 3 Familiar · 4 Learned
              </p>
            </fieldset>
            {lastChange ? (
              <div className="state-feedback" role="status">
                <span>
                  {context.vocabulary
                    ? `${stateLabels[context.vocabulary.state]} kaydedildi.`
                    : "Kelime durumu güncellendi."}
                </span>
                <button className="secondary" onClick={() => void undo()}>
                  Geri al
                </button>
              </div>
            ) : null}
          </aside>
        ) : null}
        <p className="sr-live" aria-live="polite">
          {message}
        </p>
      </main>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ReaderHeader({ title }: { title?: string }) {
  return (
    <header className="reader-header">
      <Link
        className="reader-back"
        href="/library"
        aria-label="Okuma ekranından geri dön"
      >
        <span aria-hidden="true">←</span>
        <span>Kütüphane</span>
      </Link>
      <div className="reader-header-title" aria-hidden={!title}>
        <span className="brand-mark">R</span>
        {title ? <span>{title}</span> : <span>Readify</span>}
      </div>
      <div className="reader-mode" aria-label="Okuma görünümü">
        <span className="mode-active">Sayfa</span>
      </div>
    </header>
  );
}

function ReaderParagraph({
  paragraph,
  onToken,
  onKeyDown,
  initialTabStop,
}: {
  paragraph: Paragraph;
  onToken: (
    occurrence: Occurrence,
    paragraph: Paragraph,
    target: HTMLButtonElement,
  ) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  initialTabStop: boolean;
}) {
  const scalars = [...paragraph.text];
  const pieces: React.ReactNode[] = [];
  let cursor = 0;
  for (const occurrence of [...paragraph.occurrences].sort(
    (a, b) => a.startScalar - b.startScalar,
  )) {
    if (occurrence.startScalar < cursor) continue;
    pieces.push(scalars.slice(cursor, occurrence.startScalar).join(""));
    pieces.push(
      <button
        type="button"
        className={`reader-token ${occurrence.vocabularyState ? `token-${occurrence.vocabularyState}` : ""}`}
        key={occurrence.id}
        id={`occurrence-${occurrence.id}`}
        tabIndex={initialTabStop && cursor === 0 ? 0 : -1}
        title="Kelime bilgisini aç"
        onClick={(event) =>
          void onToken(occurrence, paragraph, event.currentTarget)
        }
        onKeyDown={onKeyDown}
      >
        {scalars.slice(occurrence.startScalar, occurrence.endScalar).join("")}
      </button>,
    );
    cursor = occurrence.endScalar;
  }
  pieces.push(scalars.slice(cursor).join(""));
  return (
    <p id={paragraph.id} className="reader-paragraph">
      {pieces}
    </p>
  );
}
