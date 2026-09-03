"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
  { href: "/library", label: "Kütüphane", icon: "library" },
  { href: "/vocabulary", label: "Kelimeler", icon: "vocabulary" },
  { href: "/progress", label: "İlerleme", icon: "progress" },
] as const;

export function AppNav() {
  const router = useRouter();
  const pathname = usePathname();
  async function signOut() {
    await fetch("/api/v1/session", { method: "DELETE" });
    router.push("/sign-in");
    router.refresh();
  }
  return (
    <aside className="app-sidebar">
      <Link className="brand" href="/library" aria-label="Readify ana sayfa">
        <span className="brand-mark" aria-hidden="true">
          R
        </span>
        <span>Readify</span>
      </Link>
      <nav className="primary-nav" aria-label="Ana menü">
        {navigation.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              className="nav-item"
              href={item.href}
              aria-current={active ? "page" : undefined}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="language-chip">
          <span aria-hidden="true">FR</span>
          <span>Fransızca</span>
        </div>
        <button className="nav-item sign-out" onClick={signOut}>
          <NavIcon name="logout" />
          <span>Çıkış</span>
        </button>
      </div>
    </aside>
  );
}

function NavIcon({
  name,
}: {
  name: "library" | "vocabulary" | "progress" | "logout";
}) {
  const paths = {
    library: (
      <path d="M4 5.5h6a2 2 0 0 1 2 2v11H6a2 2 0 0 0-2 2v-15Zm16 0h-6a2 2 0 0 0-2 2v11h6a2 2 0 0 1 2 2v-15Z" />
    ),
    vocabulary: (
      <path d="M4 5h7v14H4V5Zm9 0h7v14h-7V5ZM7 9h1m8 0h1M7 12h1m8 0h1" />
    ),
    progress: <path d="M5 19V9m7 10V5m7 14v-7M3 19h18" />,
    logout: <path d="M10 5H5v14h5m4-3 4-4-4-4m4 4H9" />,
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
