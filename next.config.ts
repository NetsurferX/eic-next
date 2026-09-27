import type { NextConfig } from 'next'

const config: NextConfig = {
  // words.db is read server-side only — no need to bundle it
  // konva: folosit doar client-side (dynamic import în BuleleVulpiiGame.tsx);
  // fără asta, Turbopack încearcă să compileze intrarea Node a Konva pentru
  // bundle-ul de SSR și eșuează la `require('canvas')`, deși codul acela nu
  // rulează niciodată pe server.
  serverExternalPackages: ['better-sqlite3', 'konva'],
}

export default config

