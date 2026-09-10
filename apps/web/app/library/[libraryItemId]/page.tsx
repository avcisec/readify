"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppNav } from "../../../components/app-nav";
import { ApiProblem, api, turkishProblem } from "../../../lib/api";

type Book = {
  id: string;
  title: string;
  readerAvailable: boolean;
  hasSavedPosition: boolean;
  chapters: Array<{
    id: string;
    ordinal: number;
    title: string;
    completed: boolean;
    readerAvailable: boolean;
  }>;
  processing: { overall: string; stage: string };
};

export default function BookIndexPage() {
  const { libraryItemId } = useParams<{ libraryItemId: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book>();
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    void api<Book>(`/api/v1/library-items/${libraryItemId}/book-index`)
      .then(setBook)
      .catch((error) => {
        if (error instanceof ApiProblem && error.status === 401) {
          router.replace("/sign-in");
          return;
        }
        setMessage(
          turkishProblem(
            error instanceof Error ? error.message : "request_failed",
          ),
        );
      });
  }, [libraryItemId, router]);

  if (!book)
    return (
      <>
        <AppNav />
        <main className="app-main book-index-page">
          <p aria-live="polite">{message ?? "Kitap yükleniyor…"}</p>
        </main>
      </>
    );

  return (
    <>
      <AppNav />
      <main className="app-main book-index-page">
        <Link className="back-link" href="/library">
          ← Kütüphaneye dön
        </Link>
        <header className="book-index-header">
          <div className="book-cover book-cover-large" aria-hidden="true">
            <span className="book-language">FR</span>
            <strong>{book.title.slice(0, 1).toLocaleUpperCase("fr")}</strong>
            <span className="book-rule" />
          </div>
          <div>
            <p className="eyebrow">Yapıştırılan metin</p>
            <h1>{book.title}</h1>
            <p className="page-intro">
              {book.chapters.length} bölüm · Okuma konumun otomatik saklanır.
            </p>
            {book.readerAvailable && book.hasSavedPosition ? (
              <Link className="button-link" href={`/reader/${book.id}`}>
                Kaldığın yerden devam et <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
        </header>
        <section className="chapter-list" aria-labelledby="chapter-list-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">İçerik</p>
              <h2 id="chapter-list-title">Bölümler</h2>
            </div>
          </div>
          {book.chapters.length ? (
            <ol>
              {book.chapters.map((chapter) => (
                <li key={chapter.id}>
                  <span className="chapter-number">
                    {String(chapter.ordinal + 1).padStart(2, "0")}
                  </span>
                  <span className="chapter-copy">
                    <strong>{chapter.title}</strong>
                    <small>
                      {chapter.completed ? "Tamamlandı" : "Okunmadı"}
                    </small>
                  </span>
                  {chapter.readerAvailable ? (
                    <Link
                      className="chapter-read"
                      href={`/reader/${book.id}?sectionId=${encodeURIComponent(chapter.id)}`}
                      aria-label={`${chapter.title} bölümünü oku`}
                    >
                      <ReadIcon />
                    </Link>
                  ) : (
                    <span className="preparing-copy">Hazırlanıyor…</span>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty-state">
              Bu kitap için henüz bölüm hazır değil.
            </p>
          )}
        </section>
      </main>
    </>
  );
}

function ReadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4 0V4Z" />
      <path d="M9 20V8a4 4 0 0 1 4-4" />
    </svg>
  );
}
