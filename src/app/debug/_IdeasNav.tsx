"use client";

// src/app/debug/_IdeasNav.tsx
//
// Buton plutitor (stânga-jos) pentru navigarea între paginile cu idei.
//  · pe pagina principală (/): doar pastila „💡 Idei” → deschide meniul cu toate ideile;
//  · pe o pagină de idei: ‹ prev · [secțiune · poziție] · next › (în cadrul secțiunii,
//    ciclic; indexul secțiunii e prima poziție) + același meniu.
// position: fixed, deci nu mută și nu acoperă layout-ul paginilor existente.
// Dreapta-jos rămâne liber pentru mascotă (.mascot-dock / .fox-helper).

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS, locate, sectionItems, type IdeaPage } from "./_ideasData";

const FONT = "var(--font-inter), system-ui, sans-serif";

const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 34,
  padding: "0 0.7rem",
  fontFamily: FONT,
  fontSize: "0.78rem",
  lineHeight: 1,
  color: "#f0f3f6",
  background: "rgba(31, 35, 40, 0.92)",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

export default function IdeasNav() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const here = useMemo(() => locate(pathname), [pathname]);

  // Închide meniul la orice schimbare de pagină.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Click în afară / Esc închid meniul.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  let prev: IdeaPage | null = null;
  let next: IdeaPage | null = null;
  let label = "💡 Idei";
  if (here) {
    const items = sectionItems(here.section);
    const n = items.length;
    prev = items[(here.index - 1 + n) % n];
    next = items[(here.index + 1) % n];
    label = `${here.section.emoji} ${here.section.title} · ${here.index + 1}/${n}`;
  }

  const currentHref = here ? sectionItems(here.section)[here.index].href : null;

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        left: 14,
        bottom: 14,
        zIndex: 90,
        fontFamily: FONT,
      }}
    >
      {open && (
        <nav
          aria-label="Pagini cu idei"
          style={{
            position: "absolute",
            left: 0,
            bottom: "calc(100% + 8px)",
            width: "min(330px, calc(100vw - 28px))",
            maxHeight: "min(70vh, 540px)",
            overflowY: "auto",
            padding: "0.6rem",
            borderRadius: 14,
            color: "#f0f3f6",
            background: "rgba(22, 27, 34, 0.97)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
          }}
        >
          {SECTIONS.map((s) => (
            <details
              key={s.id}
              open={here ? s.id === here.section.id : s.id === SECTIONS[0].id}
              style={{ marginBottom: "0.2rem" }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  padding: "0.4rem 0.45rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                {s.emoji} {s.title}{" "}
                <span style={{ opacity: 0.5, fontWeight: 400 }}>· {s.pages.length}</span>
              </summary>
              <ul style={{ listStyle: "none", margin: 0, padding: "0 0 0.3rem 0.3rem" }}>
                {sectionItems(s).map((item, i) => {
                  const active = item.href === currentHref;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        style={{
                          display: "block",
                          padding: "0.32rem 0.55rem",
                          fontSize: "0.8rem",
                          borderRadius: 8,
                          textDecoration: "none",
                          color: active ? "#0d1117" : i === 0 ? "#8b949e" : "#f0f3f6",
                          background: active ? "#f0f3f6" : "transparent",
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {i === 0 ? "↳ " : ""}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}

          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              marginTop: "0.4rem",
              paddingTop: "0.5rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            {pathname !== "/" && (
              <Link href="/" style={{ ...pill, height: 30, borderRadius: 999, flex: 1 }}>
                🏠 Aplicația
              </Link>
            )}
            <Link href="/debug" style={{ ...pill, height: 30, borderRadius: 999, flex: 1 }}>
              📋 Harta site-ului
            </Link>
          </div>
        </nav>
      )}

      <div style={{ display: "inline-flex", alignItems: "center", opacity: open ? 1 : 0.85 }}>
        {prev && (
          <Link
            href={prev.href}
            aria-label={`Anterioara: ${prev.label}`}
            title={prev.label}
            style={{ ...pill, borderRadius: "999px 0 0 999px", padding: "0 0.65rem", fontSize: "1rem" }}
          >
            ‹
          </Link>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="true"
          title={here ? sectionItems(here.section)[here.index].label : "Pagini cu idei"}
          style={{
            ...pill,
            borderRadius: prev ? 0 : 999,
            borderLeft: prev ? "none" : pill.border,
            borderRight: next ? "none" : pill.border,
          }}
        >
          {label}
        </button>
        {next && (
          <Link
            href={next.href}
            aria-label={`Următoarea: ${next.label}`}
            title={next.label}
            style={{ ...pill, borderRadius: "0 999px 999px 0", padding: "0 0.65rem", fontSize: "1rem" }}
          >
            ›
          </Link>
        )}
      </div>
    </div>
  );
}
