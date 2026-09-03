"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, turkishProblem } from "../../../lib/api";

function Consumer() {
  const search = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Giriş doğrulanıyor…");
  useEffect(() => {
    const proof = search.get("proof");
    if (!proof) {
      setMessage("Giriş bağlantısı geçersiz.");
      return;
    }
    void api<{ returnPath: string }>("/api/v1/auth/email-link-sessions", {
      method: "POST",
      body: JSON.stringify({ proof }),
    })
      .then(async ({ returnPath }) => {
        const profile = await fetch("/api/v1/me/learning-profile");
        router.replace(profile.ok ? returnPath : "/onboarding");
      })
      .catch((error) =>
        setMessage(
          turkishProblem(
            error instanceof Error ? error.message : "request_failed",
          ),
        ),
      );
  }, [router, search]);
  return <p aria-live="polite">{message}</p>;
}

export default function ConsumePage() {
  return (
    <main className="narrow auth-card">
      <h1>Giriş</h1>
      <Suspense fallback={<p>Giriş doğrulanıyor…</p>}>
        <Consumer />
      </Suspense>
    </main>
  );
}
