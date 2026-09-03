"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, turkishProblem } from "../../lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [level, setLevel] = useState("A2");
  const [message, setMessage] = useState<string>();
  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await api("/api/v1/me/learning-profile", {
        method: "PUT",
        body: JSON.stringify({ targetLanguage: "fr", startingLevel: level }),
      });
      router.push("/library");
    } catch (error) {
      setMessage(
        turkishProblem(
          error instanceof Error ? error.message : "request_failed",
        ),
      );
    }
  }
  return (
    <main className="narrow auth-card">
      <h1>Öğrenme profilin</h1>
      <p>Bu ilk sürüm Fransızca okumaya odaklanır.</p>
      <form onSubmit={submit}>
        <label htmlFor="level">Yaklaşık seviyen</label>
        <select
          id="level"
          value={level}
          onChange={(event) => setLevel(event.target.value)}
        >
          {["A1", "A2", "B1", "B2", "C1", "C2"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <button type="submit">Devam et</button>
      </form>
      <p role="alert">{message}</p>
    </main>
  );
}
