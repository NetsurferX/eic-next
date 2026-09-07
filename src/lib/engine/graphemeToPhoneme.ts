// engine/graphemeToPhoneme.ts
//
// FALLBACK ONLY — used when a word is absent from BOTH lexicon tables (uk/us)
// AND isn't a regular -s/-es plural (tryPluralFallback in db.ts already
// covers that case). This module guesses a plausible American-English (us,
// rhotic — consistent with Rule 1's accent preference in db.ts) pronunciation
// straight from the spelling, using the same general letter-to-sound
// patterns native speakers apply to an unfamiliar word.
//
// IMPORTANT — this is NOT a replacement for the dictionary. English spelling
// is only partially regular; several digraphs below (ough, our, ea, oo...)
// have multiple real pronunciations and no rule can pick the right one
// without knowing the actual word. Each such case picks the statistically
// more common outcome and says so in a comment. Coverage is intentionally
// broad (B_tehnic's full phoneme inventory) but accuracy on any single
// unknown word is inherently a best guess, not an attested fact.
//
// OUTPUT CONTRACT: guessIpa() returns a raw IPA string in the EXACT same
// character conventions engine/segment.ts already expects from real
// lexicon.db rows (θ/ð/ʃ/ʒ/tʃ/dʒ/ŋ/j/w, ascii 'r' for the R sound — see the
// note below on why plain 'r' is correct everywhere, not just after schwa —
// and exactly one ˈ marking primary stress). The caller feeds it straight
// into processIpa(word, guessIpa(word)) exactly like any dictionary row;
// segment()/align()/display.ts need no changes and don't know the phonemes
// came from a guess rather than lexicon.db.
//
// NOTE on 'r': lexicon.db itself is inconsistent at the character level —
// "car" is transcribed kɑɹ (turned r, U+0279) but "computer" ends kəmˈpjutər
// (plain ascii r). Checked segment.ts's TRANSFORMS: plain ascii 'r' has no
// entry at all, so it falls through to the generic "unmatched → consonant
// segment" path with display 'r'; ɹ has an explicit identity entry ALSO
// producing display 'r'. Same result either way — so this module always
// emits plain ascii 'r' and never needs the ɹ codepoint.

// ── Small closed exception lists ───────────────────────────────────────────
// Deliberately short — just the handful of very common words whose pattern
// would otherwise mislead the general rule right next to it.

// Words where a spelled magic-e is NOT actually a long-vowel trigger.
const MAGIC_E_EXCEPTIONS = new Set([
  'have', 'give', 'live', 'love', 'glove', 'above', 'dove', 'some', 'come',
  'done', 'gone', 'none', 'one', 'are', 'were', 'active', 'positive',
])

// th → ð (voiced) only for this closed set of grammatical/function words;
// every other th guess defaults to θ (thin, think, path...).
const VOICED_TH_WORDS = new Set([
  'the', 'this', 'that', 'these', 'those', 'then', 'than', 'they', 'them',
  'their', 'there', 'though', 'thus', 'thereby', 'therefore', 'themselves',
])

// wh → h (silent w) only for this closed set; every other wh guess is w
// (silent h) — what/when/why/white/wheel etc.
const H_ONLY_WH_WORDS = new Set(['who', 'whole', 'whose', 'whom', 'whoever'])

// oo → ʊ (book) instead of the u (moon) default.
const SHORT_OO_WORDS = new Set([
  'book', 'look', 'good', 'foot', 'wood', 'hook', 'cook', 'took', 'stood',
  'wool', 'soot', 'brook', 'shook', 'crook', 'hood', 'foot', 'rook', 'nook',
])

// Stress-shifting suffixes: primary stress lands on the syllable immediately
// BEFORE the suffix. Checked longest-first against the raw spelling.
const PRE_SUFFIX_STRESS: [string, number][] = [
  // [suffix, syllables the suffix itself occupies in this approximation]
  ['ology', 1], ['ography', 1], ['onomy', 1],
  ['ician', 1], ['ussion', 1], ['ession', 1], ['ation', 1], ['ition', 1],
  ['sion', 1], ['tion', 1], ['cian', 1],
  ['ical', 1], ['ific', 1], ['ity', 1], ['ety', 1],
  ['ious', 1], ['eous', 1], ['uous', 1],
  ['ic', 1], ['ify', 1],
]

// Common unstressed prefixes — pushes default stress to the 2nd syllable on
// words long enough to have a real root after the prefix.
const UNSTRESSED_PREFIXES = [
  'un', 're', 'dis', 'mis', 'pre', 'pro', 'con', 'com', 'ex', 'in', 'im',
  'en', 'em', 'de', 'be', 'sub', 'inter', 'over', 'under',
]

const VOWEL_LETTERS = new Set(['a', 'e', 'i', 'o', 'u', 'y'])
function isVowelLetter(c: string | undefined): boolean {
  return !!c && VOWEL_LETTERS.has(c)
}

// ── Stage 1: syllable-count + stress-syllable-index heuristic ──────────────
// Counts spelling "vowel runs" as a rough syllable count (good enough for
// stress placement, not used for anything phonemic) and picks which one
// carries primary stress.
function countSyllables(word: string): number {
  let n = 0
  let inRun = false
  for (let i = 0; i < word.length; i++) {
    const v = isVowelLetter(word[i]) && !(word[i] === 'e' && i === word.length - 1 && word.length > 2)
    if (v && !inRun) n++
    inRun = v
  }
  return Math.max(1, n)
}

function stressedSyllableIndex(word: string): number {
  const syl = countSyllables(word)
  if (syl <= 1) return 0

  for (const [suffix, occupies] of PRE_SUFFIX_STRESS) {
    if (word.endsWith(suffix) && word.length > suffix.length) {
      const before = countSyllables(word.slice(0, word.length - suffix.length))
      // Stress the syllable right before the suffix's own syllable(s).
      return Math.max(0, before - 1 + (occupies > 1 ? 0 : 0))
    }
  }

  for (const p of UNSTRESSED_PREFIXES) {
    if (word.startsWith(p) && word.length > p.length + 2) {
      const prefixSyl = countSyllables(p)
      if (syl > prefixSyl) return prefixSyl // first syllable of the root
    }
  }

  return 0 // default: first syllable
}

// ── Stage 2: magic-e / -Cle detection (pre-scan, doesn't consume yet) ──────
// Returns, for each letter index, whether that vowel should be read "long"
// because of a trailing silent e (incl. the "table"-vs-"apple" split), and
// which trailing indices are silent/synthetic so the main loop can skip or
// special-case them.
interface EWordInfo {
  longVowelAt: Set<number>   // index of a vowel letter that should be long
  sylLeAt: number | null     // index of the 'l' in a trailing syllabic -Cle
  silentEAt: number | null   // index of a trailing silent 'e'
}

function analyzeEndings(word: string): EWordInfo {
  const info: EWordInfo = { longVowelAt: new Set(), sylLeAt: null, silentEAt: null }
  if (MAGIC_E_EXCEPTIONS.has(word)) return info

  // "table"/"apple"-type: vowel + (single or doubled) consonant + "le" at
  // the very end. Single consonant → preceding vowel goes long (table,
  // title, noble). Doubled consonant → preceding vowel stays short (apple,
  // little, bottle) and only one copy of the consonant sounds.
  let m = word.match(/([aeiouy])([bcdfgklmnprst])\2le$/)
  if (m && m.index !== undefined) {
    const vIdx = m.index
    info.sylLeAt = word.length - 2 // index of 'l' in "le"
    // short vowel — no entry added to longVowelAt
    void vIdx
    return info
  }
  m = word.match(/([aeiouy])([bcdfgkmnprstvz])le$/)
  if (m && m.index !== undefined) {
    info.longVowelAt.add(m.index)
    info.sylLeAt = word.length - 2
    return info
  }

  // Plain magic-e: single vowel + single consonant + final 'e'.
  m = word.match(/([aeiouy])([bcdfghjklmnpqrstvwxyz])e$/)
  if (m && m.index !== undefined && word.length >= 3) {
    info.longVowelAt.add(m.index)
    info.silentEAt = word.length - 1
  }
  return info
}

// ── Stage 3: main left-to-right grapheme consumption ───────────────────────

interface Piece { consumed: number; ipa: string; vowel: boolean }

function consumeAt(word: string, i: number, info: EWordInfo): Piece {
  const c = word[i]
  const c2 = word.slice(i, i + 2)
  const c3 = word.slice(i, i + 3)
  const c4 = word.slice(i, i + 4)
  const next = word[i + 1]
  const prev = word[i - 1]

  // Trailing syllabic -Cle ("table" → ...b + "əl", "apple" → ...p + "əl")
  if (info.sylLeAt === i) return { consumed: 2, ipa: 'əl', vowel: true }
  // Silent trailing magic-e
  if (info.silentEAt === i) return { consumed: 1, ipa: '', vowel: false }

  // ── Vowel digraphs / diphthongs (longest match first) ──────────────────
  if (c4 === 'ough') {
    // Famously irregular (through/though/tough/cough/bough/thought all
    // differ). No rule can disambiguate from spelling alone — 'ʌf' is the
    // more common outcome across the -ough word family and is used as the
    // default guess; genuinely wrong for the "oo"/"oh"/"ow" branches.
    return { consumed: 4, ipa: 'ʌf', vowel: true }
  }
  if (c4 === 'augh') return { consumed: 4, ipa: 'ɔ', vowel: true } // caught-like
  if (c3 === 'igh') return { consumed: 3, ipa: 'aɪ', vowel: true }
  if (c4 === 'eigh') return { consumed: 4, ipa: 'eɪ', vowel: true }
  if (c3 === 'eer') return { consumed: 3, ipa: 'ɪr', vowel: true }
  if (c3 === 'air') return { consumed: 3, ipa: 'ɛr', vowel: true }
  if (c3 === 'ear') {
    // word-final (or followed only by a vowel-suffix letter) → NEAR (fear,
    // clear); followed directly by another consonant → NURSE (learn, earth).
    const tail = word.slice(i + 3)
    return tail === '' || isVowelLetter(tail[0])
      ? { consumed: 3, ipa: 'ɪr', vowel: true }
      : { consumed: 3, ipa: 'ər', vowel: true }
  }
  if (c3 === 'oor') return { consumed: 3, ipa: 'ɔr', vowel: true }
  if (c3 === 'our' && i + 3 === word.length) {
    // Highly irregular family (hour/our/four/colour/tour all differ) —
    // schwa+r ("colour/favour/honour") is the more common unstressed
    // outcome and the default guess here.
    return { consumed: 3, ipa: 'ər', vowel: true }
  }
  if (c3 === 'are' && i + 3 === word.length) return { consumed: 3, ipa: 'ɛr', vowel: true } // share, care
  if (c3 === 'ure' && i + 3 === word.length) return { consumed: 3, ipa: 'ʊr', vowel: true } // pure, cure
  if (c2 === 'ar') {
    if (word[i - 1] === 'w') return { consumed: 2, ipa: 'ər', vowel: true } // war-/wor- (word, work)
    if (!isVowelLetter(next)) return { consumed: 2, ipa: 'ɑr', vowel: true }
  }
  if (c2 === 'or') {
    if (word[i - 1] === 'w' && word[i - 2] !== 'w') return { consumed: 2, ipa: 'ər', vowel: true } // word, work, world
    if (!isVowelLetter(next)) return { consumed: 2, ipa: 'ɔr', vowel: true }
  }
  if ((c2 === 'er' || c2 === 'ir' || c2 === 'ur' || c2 === 'yr') && !isVowelLetter(next)) {
    return { consumed: 2, ipa: 'ər', vowel: true }
  }
  if (c2 === 'ai' || c2 === 'ay') return { consumed: 2, ipa: 'eɪ', vowel: true }
  if (c2 === 'oy' || c2 === 'oi') return { consumed: 2, ipa: 'ɔɪ', vowel: true }
  if (c2 === 'au' || c2 === 'aw') return { consumed: 2, ipa: 'ɔ', vowel: true }
  if (c2 === 'oa') return { consumed: 2, ipa: 'oʊ', vowel: true }
  if (c2 === 'oe' && i + 2 === word.length) return { consumed: 2, ipa: 'oʊ', vowel: true }
  if (c2 === 'ow') {
    // Short/common monosyllable-ish words (cow, how, now, brown, town) go
    // /aʊ/; longer multi-syllable "-ow" words (yellow, window, follow) are
    // usually /oʊ/. No perfect rule — length + position is the best proxy.
    const isWordFinal = i + 2 === word.length
    return isWordFinal && word.length > 5
      ? { consumed: 2, ipa: 'oʊ', vowel: true }
      : { consumed: 2, ipa: 'aʊ', vowel: true }
  }
  if (c2 === 'ou') return { consumed: 2, ipa: 'aʊ', vowel: true } // loud, found (default; ou is also ʌ/u/ɔ in some words)
  if (c2 === 'ee' || c2 === 'ea') return { consumed: 2, ipa: 'i', vowel: true } // see, eat (ea is also ɛ sometimes — bread)
  if (c2 === 'oo') {
    return SHORT_OO_WORDS.has(word)
      ? { consumed: 2, ipa: 'ʊ', vowel: true }
      : { consumed: 2, ipa: 'u', vowel: true }
  }
  if (c2 === 'ie') {
    return i + 2 === word.length
      ? { consumed: 2, ipa: 'aɪ', vowel: true } // tie, die
      : { consumed: 2, ipa: 'i', vowel: true }  // believe, field
  }
  if (c2 === 'ei') return { consumed: 2, ipa: 'i', vowel: true } // receive (default; eight handled by 'eigh' above)
  if (c2 === 'ue') return { consumed: 2, ipa: 'u', vowel: true } // blue, true
  if (c2 === 'ui') return { consumed: 2, ipa: 'u', vowel: true } // fruit, suit

  // ── Consonant digraphs / silent-letter clusters ─────────────────────────
  if (c3 === 'tch') return { consumed: 3, ipa: 'tʃ', vowel: false }
  if (c3 === 'dge') return { consumed: 3, ipa: 'dʒ', vowel: false }
  if (c2 === 'ch') return { consumed: 2, ipa: 'tʃ', vowel: false }
  if (c2 === 'sh') return { consumed: 2, ipa: 'ʃ', vowel: false }
  if (c2 === 'ph') return { consumed: 2, ipa: 'f', vowel: false }
  if (c2 === 'wh') {
    return H_ONLY_WH_WORDS.has(word)
      ? { consumed: 2, ipa: 'h', vowel: false }
      : { consumed: 2, ipa: 'w', vowel: false }
  }
  if (c2 === 'th') {
    return { consumed: 2, ipa: VOICED_TH_WORDS.has(word) ? 'ð' : 'θ', vowel: false }
  }
  if (c2 === 'ng') return { consumed: 2, ipa: 'ŋ', vowel: false }
  if (c2 === 'ck') return { consumed: 2, ipa: 'k', vowel: false }
  if (c2 === 'qu') return { consumed: 2, ipa: 'kw', vowel: false }
  if (c2 === 'kn' && i === 0) return { consumed: 2, ipa: 'n', vowel: false }
  if (c2 === 'gn' && i === 0) return { consumed: 2, ipa: 'n', vowel: false }
  if (c2 === 'gn' && i + 2 === word.length) return { consumed: 2, ipa: 'n', vowel: false }
  if (c2 === 'wr' && i === 0) return { consumed: 2, ipa: 'r', vowel: false }
  if (c2 === 'mb' && i + 2 === word.length) return { consumed: 2, ipa: 'm', vowel: false }
  if (c2 === 'mn' && i + 2 === word.length) return { consumed: 2, ipa: 'm', vowel: false }
  if (c2 === 'gh') {
    // Onset/other 'gh' not already claimed by igh/eigh/augh/ough above.
    return { consumed: 2, ipa: 'g', vowel: false }
  }
  // Doubled consonants collapse to one sound.
  if (c === next && 'bcdfgklmnprstz'.includes(c)) {
    return { consumed: 2, ipa: singleConsonant(c, word, i), vowel: false }
  }

  // ── Single vowels ────────────────────────────────────────────────────────
  if (c === 'y' && (i === 0)) return { consumed: 1, ipa: 'j', vowel: false } // yes, young — onset y is a consonant/glide
  if (isVowelLetter(c)) {
    const long = info.longVowelAt.has(i)
    if (c === 'a') return { consumed: 1, ipa: long ? 'eɪ' : 'æ', vowel: true }
    if (c === 'e') return { consumed: 1, ipa: long ? 'i' : 'ɛ', vowel: true }
    if (c === 'i') return { consumed: 1, ipa: long ? 'aɪ' : 'ɪ', vowel: true }
    if (c === 'o') return { consumed: 1, ipa: long ? 'oʊ' : 'ɑ', vowel: true }
    if (c === 'u') return { consumed: 1, ipa: long ? 'ju' : 'ʌ', vowel: true }
    if (c === 'y') {
      const wordFinal = i + 1 === word.length
      if (!wordFinal) return { consumed: 1, ipa: 'ɪ', vowel: true } // gym, myth
      // word-final y: short word (monosyllabic root) → /aɪ/ (fly, sky, cry);
      // longer word → unstressed /i/ (happy, city, family)
      return countSyllables(word) <= 1
        ? { consumed: 1, ipa: 'aɪ', vowel: true }
        : { consumed: 1, ipa: 'i', vowel: true }
    }
  }

  // ── Single consonants ────────────────────────────────────────────────────
  return { consumed: 1, ipa: singleConsonant(c, word, i), vowel: false }
}

function singleConsonant(c: string, word: string, i: number): string {
  const next = word[i + 1]
  switch (c) {
    case 'c':
      return (next === 'e' || next === 'i' || next === 'y') ? 's' : 'k'
    case 'g':
      return (next === 'e' || next === 'i' || next === 'y') ? 'dʒ' : 'ɡ'
    case 'j': return 'dʒ'
    case 'x':
      return i === 0 ? 'z' : 'ks'
    case 's': {
      // Between two vowels, 's' is very often voiced (/z/) — rose, present,
      // easy. Elsewhere (onset, before a consonant, word-final after a
      // consonant) it stays /s/.
      const prev = word[i - 1]
      return (isVowelLetter(prev) && isVowelLetter(next)) ? 'z' : 's'
    }
    default:
      // b,d,f,h,k,l,m,n,p,r,t,v,w,z map 1:1 onto their own IPA symbol.
      return c
  }
}

// ── Public entry point ──────────────────────────────────────────────────────

export function guessIpa(rawWord: string): string {
  const word = rawWord.toLowerCase().replace(/[^a-z']/g, '')
  if (!word) return ''

  const info = analyzeEndings(word)
  const stressIdx = stressedSyllableIndex(word)

  let out = ''
  let syllablesSeen = -1
  let inVowelRun = false
  let stressInserted = false
  let i = 0

  while (i < word.length) {
    const piece = consumeAt(word, i, info)

    if (piece.vowel && !inVowelRun) {
      syllablesSeen++
      if (syllablesSeen === stressIdx && !stressInserted) {
        out += 'ˈ'
        stressInserted = true
      }
    }
    inVowelRun = piece.vowel

    out += piece.ipa
    i += Math.max(1, piece.consumed) // never loop forever on an unmatched char
  }

  if (!stressInserted) out = 'ˈ' + out // safety net — always mark a stress
  return out
}
