"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "../../components/app-nav";
import { api, idempotencyKey, turkishProblem } from "../../lib/api";

export default function ImportPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [source, setSource] = useState<"text" | "pdf" | "epub">("text");
  const [file, setFile] = useState<File>();
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(undefined);
    try {
      const isText = source === "text";
      const body = isText
        ? JSON.stringify({ text })
        : (() => {
            const form = new FormData();
            form.set("source", source);
            if (file) form.set("file", file);
            return form;
          })();
      const result = await api<{ outcome: string }>(
        isText ? "/api/v1/imports/pasted-text" : "/api/v1/imports/file",
        {
          method: "POST",
          headers: { "Idempotency-Key": idempotencyKey() },
          body,
        },
      );
      setMessage(
        result.outcome === "duplicate"
          ? "Bu metin zaten kütüphanende."
          : "İçerik eklendi; arka planda hazırlanıyor.",
      );
      window.setTimeout(() => router.push("/library"), 500);
    } catch (error) {
      setMessage(
        turkishProblem(
          error instanceof Error ? error.message : "request_failed",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AppNav />
      <main className="app-main import-page">
        <section className="page-heading">
          <Link className="back-link" href="/library">
            ← Kütüphaneye dön
          </Link>
          <p className="eyebrow">Yeni içerik</p>
          <h1>İçe aktar</h1>
          <p className="page-intro">
            Kopyaladığın Fransızca metni çalışma alanına al ve okumaya başla.
          </p>
        </section>
        <section className="panel import-panel" aria-labelledby="import-title">
          <div className="panel-heading">
            <div className="feature-icon" aria-hidden="true">
              {source === "text" ? "Aa" : source.toUpperCase()}
            </div>
            <div>
              <h2 id="import-title">İçerik kaynağı</h2>
              <p>İçeriğin özel kalır ve arka planda hazırlanır.</p>
            </div>
          </div>
          <div
            className="import-source-picker"
            role="group"
            aria-label="İçe aktarma türü"
          >
            {(["text", "pdf", "epub"] as const).map((option) => (
              <button
                type="button"
                className={
                  source === option ? "source-option selected" : "source-option"
                }
                aria-pressed={source === option}
                onClick={() => setSource(option)}
                key={option}
              >
                {option === "text" ? "TEXT" : option.toUpperCase()}
              </button>
            ))}
          </div>
          <form onSubmit={submit}>
            {source === "text" ? (
              <>
                <label htmlFor="pasted-text">Fransızca metin</label>
                <textarea
                  id="pasted-text"
                  rows={16}
                  maxLength={100000}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Metni buraya yapıştır…"
                  aria-describedby="text-count"
                  required
                />
              </>
            ) : (
              <>
                <label htmlFor="source-file">
                  {source.toUpperCase()} dosyası
                </label>
                <input
                  id="source-file"
                  type="file"
                  accept={
                    source === "pdf"
                      ? ".pdf,application/pdf"
                      : ".epub,application/epub+zip"
                  }
                  onChange={(event) => setFile(event.target.files?.[0])}
                  required
                />
                <p className="form-help">
                  En fazla 200 MB. Taranmış PDF ve DRM korumalı EPUB
                  desteklenmez.
                </p>
              </>
            )}
            <div className="form-row">
              {source === "text" ? (
                <span id="text-count" className="character-count">
                  {[...text].length.toLocaleString("tr-TR")} / 50.000 karakter
                </span>
              ) : (
                <span className="character-count">
                  {file?.name ?? "Dosya seçilmedi"}
                </span>
              )}
              <button
                disabled={
                  busy || (source === "text" ? [...text].length > 50000 : !file)
                }
              >
                {busy ? "İçe aktarılıyor…" : "İçe aktar"}
              </button>
            </div>
          </form>
          <p className="inline-message" aria-live="polite">
            {message}
          </p>
        </section>
      </main>
    </>
  );
}
