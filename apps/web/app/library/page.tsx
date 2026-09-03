"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "../../components/app-nav";
import { ApiProblem, api, idempotencyKey, turkishProblem } from "../../lib/api";

type Item = {
  id: string;
  title: string;
  readerAvailable: boolean;
  hasSavedPosition: boolean;
  processing: {
    overall: string;
    stage: string;
    capabilities: { text: string; wordTools: string };
    retryableCapabilities: string[];
    error: null | { code: string; referenceId: string };
  };
};

const stageCopy: Record<string, string> = {
  queued: "Sırada",
  preparing_text: "Metin hazırlanıyor",
  analyzing_language: "Kelime araçları hazırlanıyor",
  complete: "Hazır",
};

export default function LibraryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string>();
  const [mismatch, setMismatch] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      setItems((await api<{ items: Item[] }>("/api/v1/library-items")).items);
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
  }, [router]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!items.some((item) => item.processing.overall === "processing")) return;
    const timer = window.setTimeout(() => void load(), 1500);
    return () => window.clearTimeout(timer);
  }, [items, load]);

  async function submit(event?: FormEvent, accepted = false) {
    event?.preventDefault();
    setBusy(true);
    setMessage(undefined);
    try {
      const result = await api<{ outcome: string; libraryItem: Item }>(
        "/api/v1/imports/pasted-text",
        {
          method: "POST",
          headers: { "Idempotency-Key": idempotencyKey() },
          body: JSON.stringify({ text, languageMismatchAccepted: accepted }),
        },
      );
      setText("");
      setMismatch(false);
      setMessage(
        result.outcome === "duplicate"
          ? "Bu metin zaten kütüphanende."
          : "Metin eklendi; arka planda hazırlanıyor.",
      );
      await load();
    } catch (error) {
      if (error instanceof ApiProblem && error.code === "language_mismatch")
        setMismatch(true);
      setMessage(
        turkishProblem(
          error instanceof Error ? error.message : "request_failed",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  async function retry(item: Item) {
    await api(`/api/v1/library-items/${item.id}/processing-retries`, {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey() },
      body: JSON.stringify({ capability: "word_tools" }),
    });
    await load();
  }

  return (
    <>
      <AppNav />
      <main className="app-main library-page">
        <section className="page-heading library-heading">
          <div>
            <p className="eyebrow">Okuma alanın</p>
            <h1>Kütüphane</h1>
            <p className="page-intro">
              Fransızca metinlerini ekle, kaldığın yerden okumaya devam et.
            </p>
          </div>
          <a className="button-link heading-action" href="#import-title">
            <span aria-hidden="true">＋</span> Metin ekle
          </a>
        </section>
        <section className="panel import-panel" aria-labelledby="import-title">
          <div className="panel-heading">
            <div className="feature-icon" aria-hidden="true">
              Aa
            </div>
            <div>
              <h2 id="import-title">Yeni metin ekle</h2>
              <p>Kopyaladığın Fransızca metni doğrudan çalışma alanına al.</p>
            </div>
          </div>
          <form onSubmit={submit}>
            <label htmlFor="pasted-text">Fransızca metin</label>
            <textarea
              id="pasted-text"
              rows={10}
              maxLength={100000}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Metni buraya yapıştır…"
              aria-describedby="text-count"
              required
            />
            <div className="form-row">
              <span id="text-count" className="character-count">
                {[...text].length.toLocaleString("tr-TR")} / 50.000 karakter
              </span>
              <button disabled={busy || [...text].length > 50000}>
                {busy ? "Ekleniyor…" : "Kütüphaneye ekle"}
              </button>
            </div>
          </form>
          {mismatch ? (
            <button
              className="secondary"
              onClick={() => void submit(undefined, true)}
            >
              Yine de Fransızca olarak ekle
            </button>
          ) : null}
          <p className="inline-message" aria-live="polite">
            {message}
          </p>
        </section>
        <section className="library-collection" aria-labelledby="library-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Koleksiyon</p>
              <h2 id="library-title">Metinlerin</h2>
            </div>
            {items.length > 0 ? (
              <span className="item-count">{items.length} metin</span>
            ) : null}
          </div>
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration" aria-hidden="true">
                <span>R</span>
              </div>
              <h3>Okuma rafın henüz boş</h3>
              <p>
                İlk Fransızca metnini yukarıya yapıştırarak başlayabilirsin.
              </p>
              <a className="button-link" href="#import-title">
                İlk metni ekle
              </a>
            </div>
          ) : (
            <div className="card-grid">
              {items.map((item) => (
                <article className="item-card" key={item.id}>
                  <div className="book-cover" aria-hidden="true">
                    <span className="book-language">FR</span>
                    <strong>
                      {item.title.slice(0, 1).toLocaleUpperCase("fr")}
                    </strong>
                    <span className="book-rule" />
                  </div>
                  <div className="item-card-body">
                    <p className="item-kind">Yapıştırılan metin</p>
                    <h3>{item.title}</h3>
                    <span
                      className={`status status-${item.processing.overall}`}
                    >
                      {stageCopy[item.processing.stage] ??
                        item.processing.stage}
                    </span>
                    <div className="item-card-actions">
                      {item.readerAvailable ? (
                        <Link
                          className="button-link"
                          href={`/reader/${item.id}`}
                        >
                          {item.hasSavedPosition ? "Devam et" : "Oku"}
                          <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <span className="preparing-copy">
                          Okuyucu hazırlanıyor…
                        </span>
                      )}
                    </div>
                    {item.processing.overall === "ready_degraded" ? (
                      <p className="card-note">
                        Metin okunabilir; kelime araçları şu an kullanılamıyor.
                      </p>
                    ) : null}
                    {item.processing.retryableCapabilities.includes(
                      "word_tools",
                    ) ? (
                      <button
                        className="secondary"
                        onClick={() => void retry(item)}
                      >
                        Kelime araçlarını yeniden dene
                      </button>
                    ) : null}
                    {item.processing.error ? (
                      <small>
                        Referans: {item.processing.error.referenceId}
                      </small>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
