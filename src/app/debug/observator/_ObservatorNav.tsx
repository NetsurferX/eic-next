"use client";

// src/app/debug/observator/_ObservatorNav.tsx
//
// Bară de navigare comună, ca să poți circula între cele 3 concepte fără
// să te întorci mereu la index. Fiecare pagină își dă tema (light pt.
// harta-cadastrală, dark pt. sala-control/tura-de-gardă) și accentul ei
// existent, ca butoanele să nu bată cu restul paginii.

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "sala-control", label: "🎛 Sala de control" },
  { slug: "harta-cadastrala", label: "🗺 Harta cadastrală" },
  { slug: "tura-de-garda", label: "🚨 Tura de gardă" },
] as const;

interface Props {
  theme: "light" | "dark";
  accent: string; // culoarea de accent a paginii curente (folosită pt. tab-ul activ)
}

export default function ObservatorNav({ theme, accent }: Props) {
  const pathname = usePathname();
  const dark = theme === "dark";

  const base = {
    fontSize: "0.76rem",
    padding: "0.32rem 0.65rem",
    borderRadius: 999,
    textDecoration: "none",
    fontFamily: dark ? "'JetBrains Mono', 'SF Mono', Menlo, monospace" : "inherit",
    border: `1px solid ${dark ? "#30363d" : "var(--color-border)"}`,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
  } as const;

  const inactiveColor = dark ? "#8b949e" : "inherit";
  const inactiveBg = dark ? "#161b22" : "transparent";

  return (
    <nav
      aria-label="Navigare între conceptele observator"
      style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}
    >
      <Link
        href="/debug/observator"
        style={{
          ...base,
          color: inactiveColor,
          background: inactiveBg,
          opacity: 0.85,
        }}
      >
        ← index
      </Link>
      {TABS.map((t) => {
        const href = `/debug/observator/${t.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={t.slug}
            href={href}
            aria-current={active ? "page" : undefined}
            style={{
              ...base,
              color: active ? (dark ? "#0d1117" : "#fff") : inactiveColor,
              background: active ? accent : inactiveBg,
              borderColor: active ? accent : base.border.split(" ")[2],
              fontWeight: active ? 600 : 400,
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
