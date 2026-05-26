import type { NextConfig } from 'next'

const config: NextConfig = {
  // words.db is read server-side only — no need to bundle it
  serverExternalPackages: ['better-sqlite3'],
}

export default config

