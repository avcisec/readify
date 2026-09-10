"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "../../components/app-nav";
import { ApiProblem, api } from "../../lib/api";

type Summary = {
  completedSections: number;
  vocabulary: { learning: number; known: number; ignored: number };
  computedAt: string;
};
export default function ProgressPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary>();
  useEffect(() => {
    let active = true;
    const load = () =>
      void api<Summary>("/api/v1/progress/summary")
        .then((value) => {
          if (active) setSummary(value);
        })
        .catch((error) => {
          if (error instanceof ApiProblem && error.status === 401)
            router.replace("/sign-in");
        });
    load();
    const timer = window.setInterval(load, 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [router]);
  return (
    <>
      <AppNav />
      <main>
        <div className="page-heading">
          <div>
            <h1>İlerleme</h1>
            <p>
              Yalnızca tamamladığın bölümler ve kendi bildirdiğin kelime
              durumları.
            </p>
          </div>
        </div>
        {!summary ? (
          <p>Yükleniyor…</p>
        ) : (
          <div className="metrics">
            <article>
              <strong>{summary.completedSections}</strong>
              <span>Tamamlanan bölüm</span>
            </article>
            <article>
              <strong>{summary.vocabulary.learning}</strong>
              <span>1–4 aşamasındaki kelimeler</span>
            </article>
            <article>
              <strong>{summary.vocabulary.known}</strong>
              <span>Biliyorum</span>
            </article>
            <article>
              <strong>{summary.vocabulary.ignored}</strong>
              <span>Yoksayılan</span>
            </article>
          </div>
        )}
        <p className="muted">
          Bu sayılar hatırlama başarısı veya yeterlilik puanı değildir.
        </p>
      </main>
    </>
  );
}
