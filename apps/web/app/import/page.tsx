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
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(undefined);
    try {
      const result = await api<{ outcome: string }>(
        "/api/v1/imports/pasted-text",
        {
          method: "POST",
          headers: { "Idempotency-Key": idempotencyKey() },
          body: JSON.stringify({ text }),
        },
      );
      setMessage(
        result.outcome === "duplicate"
          ? "Bu metin zaten kütüphanende."
          : "Metin eklendi; arka planda hazırlanıyor.",
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
          <h1>Metin ekle</h1>
          <p className="page-intro">
            Kopyaladığın Fransızca metni çalışma alanına al ve okumaya başla.
          </p>
        </section>
        <section className="panel import-panel" aria-labelledby="import-title">
          <div className="panel-heading">
            <div className="feature-icon" aria-hidden="true">
              Aa
            </div>
            <div>
              <h2 id="import-title">Fransızca metnin</h2>
              <p>Metnin özel kalır ve arka planda hazırlanır.</p>
            </div>
          </div>
          <form onSubmit={submit}>
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
            <div className="form-row">
              <span id="text-count" className="character-count">
                {[...text].length.toLocaleString("tr-TR")} / 50.000 karakter
              </span>
              <button disabled={busy || [...text].length > 50000}>
                {busy ? "Ekleniyor…" : "Kütüphaneye ekle"}
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
