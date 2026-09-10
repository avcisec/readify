"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
type LearningProfile = { targetLanguage: "fr"; startingLevel: string };

const stageCopy: Record<string, string> = {
  queued: "Sırada",
  preparing_text: "Metin hazırlanıyor",
  analyzing_language: "Kelime araçları hazırlanıyor",
  complete: "Hazır",
};

export default function LibraryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [profile, setProfile] = useState<LearningProfile>();
  const [message, setMessage] = useState<string>();
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
    void api<LearningProfile>("/api/v1/me/learning-profile")
      .then(setProfile)
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    if (!items.some((item) => item.processing.overall === "processing")) return;
    const timer = window.setTimeout(() => void load(), 1500);
    return () => window.clearTimeout(timer);
  }, [items, load]);

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
            {profile ? (
              <p className="profile-summary" aria-label="Öğrenme profili">
                <span aria-hidden="true">FR</span>
                Fransızca · {profile.startingLevel}
              </p>
            ) : null}
          </div>
          <Link className="heading-action button-link" href="/import">
            <span>Metin ekle</span>
            <span aria-hidden="true">+</span>
          </Link>
        </section>
        <p className="inline-message" aria-live="polite">
          {message}
        </p>
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
              <p>İlk Fransızca metnini ekleyerek başlayabilirsin.</p>
              <Link className="button-link" href="/import">
                İlk metni ekle
              </Link>
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
                          href={`/library/${item.id}`}
                        >
                          Kitabı aç <span aria-hidden="true">→</span>
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
