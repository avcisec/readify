"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "../../components/app-nav";
import { ApiProblem, api, turkishProblem } from "../../lib/api";

type VocabularyItem = {
  id: string;
  lemma: string;
  firstSurface: string;
  partOfSpeech: string;
  state: "learning" | "known" | "ignored";
  firstSentence: string;
  occurrenceCount: number;
  source: { libraryItemId: string; occurrenceId: string };
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
const labels = {
  learning: "Öğreniyorum",
  known: "Biliyorum",
  ignored: "Yoksay",
};

export default function VocabularyPage() {
  const router = useRouter();
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [message, setMessage] = useState<string>();
  const load = useCallback(async () => {
    try {
      setItems(
        (await api<{ items: VocabularyItem[] }>("/api/v1/vocabulary-items"))
          .items,
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
  }, [router]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <>
      <AppNav />
      <main>
        <div className="page-heading">
          <div>
            <h1>Kelimeler</h1>
            <p>Okurken açıkça işaretlediğin lemma durumları.</p>
          </div>
        </div>
        <p aria-live="polite">{message}</p>
        {items.length === 0 ? (
          <div className="empty-state">
            <p>Henüz kaydettiğin kelime yok.</p>
          </div>
        ) : (
          <ul className="vocabulary-list">
            {items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.lemma}</strong>
                  <span>Metindeki biçim: {item.firstSurface}</span>
                  <span>{item.firstSentence}</span>
                  <span>{item.occurrenceCount} kullanım</span>
                  {item.meaning.availability === "available" ? (
                    <span>
                      Türkçe: {item.meaning.meaning} · Kaynak:{" "}
                      {item.meaning.source}
                    </span>
                  ) : (
                    <span>
                      {item.meaning.reason === "not_in_fixture"
                        ? "Sınırlı geliştirme sözlüğünde yok; gerçek sözlük henüz bağlı değil."
                        : "Anlam kaynağına şu an ulaşılamıyor."}
                    </span>
                  )}
                  <Link
                    href={`/reader/${item.source.libraryItemId}#occurrence-${item.source.occurrenceId}`}
                  >
                    Metinde aç
                  </Link>
                </div>
                <span className={`state state-${item.state}`}>
                  {labels[item.state]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
