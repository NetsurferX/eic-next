// src/app/debug/layout.tsx
//
// Layout NOU pentru toate rutele /debug/*: randează pagina exact ca înainte
// și adaugă doar butonul plutitor de navigare între idei (position: fixed).
// Nicio pagină existentă din /debug nu e modificată.

import IdeasNav from "./_IdeasNav";

export default function DebugLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <IdeasNav />
    </>
  );
}
