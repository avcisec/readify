"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { api, turkishProblem } from "../../lib/api";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [localProof, setLocalProof] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const submittedEmail = String(
      new FormData(event.currentTarget as HTMLFormElement).get("email") ?? "",
    );
    setBusy(true);
    setMessage(undefined);
    try {
      await api("/api/v1/auth/email-link-requests", {
        method: "POST",
        body: JSON.stringify({ email: submittedEmail, returnPath: "/library" }),
      });
      setMessage("Giriş bağlantısı gönderildi.");
      const outbox = await api<{ proof: string }>(
        "/api/v1/dev/email-outbox/latest",
      ).catch(() => null);
      if (outbox) setLocalProof(outbox.proof);
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
    <main className="narrow auth-card">
      <h1>Readify’a giriş</h1>
      <p>Fransızca metinlerini okuyup kelimelerini kendi hızında takip et.</p>
      <form onSubmit={submit}>
        <label htmlFor="email">E-posta</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit" disabled={busy}>
          {busy ? "Gönderiliyor…" : "Giriş bağlantısı gönder"}
        </button>
      </form>
      <p aria-live="polite">{message}</p>
      {localProof ? (
        <a
          className="button-link"
          href={`/auth/consume?proof=${encodeURIComponent(localProof)}`}
        >
          Yerel giriş bağlantısını aç
        </a>
      ) : null}
    </main>
  );
}
