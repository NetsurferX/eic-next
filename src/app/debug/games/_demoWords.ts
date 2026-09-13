// src/app/debug/games/_demoWords.ts
//
// Self-contained demo data for the /debug/games/* concept wireframes.
// Underscore prefix => Next.js App Router ignores this folder for routing.
// Hand-crafted nodes (same shape as GameNode from lib/gameTypes.ts) so the
// concepts render through the REAL WordRenderer, without touching the
// engine or the lexicon DB. Colours copied from rules/colors.ts by hand for
// these 8 example words only — NOT a new source of truth, just fixtures.

import type { GameNode } from '@/lib/gameTypes'

export interface DemoWord {
  word: string
  nodes: GameNode[]
  dominantColor: string
  dominantLabel: string
}

const n = (t: string, s: string, c: string, u = false, x = false): GameNode => ({ t, s, c, u, x })

export const DEMO_WORDS: DemoWord[] = [
  {
    word: 'cat',
    dominantColor: '#00A2E0',
    dominantLabel: 'æ',
    nodes: [n('c', 'k', '', false, true), n('a', 'æ', '#00A2E0'), n('t', 't', '', false, true)],
  },
  {
    word: 'car',
    dominantColor: '#008E40',
    dominantLabel: 'ɑ',
    nodes: [n('c', 'k', '', false, true), n('ar', 'ɑ', '#008E40')],
  },
  {
    word: 'see',
    dominantColor: '#CC0000',
    dominantLabel: 'iː',
    nodes: [n('s', 's', '', false, true), n('ee', 'iː', '#CC0000')],
  },
  {
    word: 'sit',
    dominantColor: '#E57373',
    dominantLabel: 'ɪ',
    nodes: [n('s', 's', '', false, true), n('i', 'ɪ', '#E57373'), n('t', 't', '', false, true)],
  },
  {
    word: 'boot',
    dominantColor: '#7030A0',
    dominantLabel: 'uː',
    nodes: [n('b', 'b', '', false, true), n('oo', 'uː', '#7030A0'), n('t', 't', '', false, true)],
  },
  {
    word: 'red',
    dominantColor: '#EE5B00',
    dominantLabel: 'ɛ',
    nodes: [n('r', 'r', '', false, true), n('e', 'ɛ', '#EE5B00'), n('d', 'd', '', false, true)],
  },
  {
    word: 'dog',
    dominantColor: '#FF3399',
    dominantLabel: 'ɒ',
    nodes: [n('d', 'd', '', false, true), n('o', 'ɒ', '#FF3399'), n('g', 'g', '', false, true)],
  },
  {
    word: 'about',
    dominantColor: '#000000',
    dominantLabel: 'ə',
    nodes: [n('a', 'ə', '#000000'), n('b', 'b', '', false, true), n('ou', 'aʊ', '#0033CC'), n('t', 't', '', false, true)],
  },
]
