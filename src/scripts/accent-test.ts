// Self-contained test harness: minimal pipeline logic inlined to avoid
// module resolution issues when running via ts-node.

const COLOR_SILENT = '#000000'
const COLOR_CONSONANT = '#000000'

const COLOR_MAP: Record<string, string> = {
  'æ':  '#00b0f0',
  'ʌ':  '#008E40', 'a': '#008E40', 'ɑ': '#008E40',
  'ə':  '#888888', 'ɜ': '#888888', 'ər': '#888888', 'er': '#888888',
  'e':  '#EE5B00', 'ɛ': '#EE5B00', 'eɪ': '#EE5B00', 'eỷ': '#EE5B00',
  'ɪ':  '#CC0000', 'i': '#CC0000', 'iː': '#CC0000',
  'ɒ':  '#FF3399', 'ɔ': '#FF3399', 'o':  '#FF3399',
  'oʊ': '#FF3399', 'əw': '#FF3399',
  'ʊ':  '#7030A0', 'u': '#7030A0', 'uː': '#7030A0',
  'aɪ': '#4472C4', 'aỷ': '#4472C4', 'aw': '#4472C4',
  'aʊ': '#4472C4', 'oɪ': '#4472C4', 'oỷ': '#4472C4', 'ɔɪ': '#4472C4',
  'j':  '#E57373', 'w': '#E57373', 'ỷ': '#E57373',
}

function getColor(sound: string): string | null {
  if (!sound) return null
  const k = sound.toLowerCase()
  if (COLOR_MAP[k]) return COLOR_MAP[k]
  if (k.length > 1 && COLOR_MAP[k[0]]) return COLOR_MAP[k[0]]
  return null
}

const VOWEL_CHARS = new Set([...'aeioujæɑɔəwɛɪʊʌyøœɒɝɚɜỷ'])
function isVowelSound(s: string): boolean { return s.length > 0 && VOWEL_CHARS.has(s[0]) }

const TRANSFORMS: [string,string][] = [
  ['ɜːr','ər'],['ɝːr','ər'],['ɚːr','ər'],['ɜr','ər'],['ɝr','ər'],['ɚr','ər'],['ɜː','ər'],['ɝː','ər'],['ɚː','ər'],['ɜ','ər'],['ɝ','ər'],['ɚ','ər'],
  ['ɔːr','or'],['ɔr','or'],['ɔɹ','or'],['ɔɪ','oỷ'],['oɪ','oỷ'],['aɪ','aỷ'],['eɪ','eỷ'],['aʊ','aw'],['əʊ','əw'],['oʊ','əw'],['ɛːr','er'],['ɛr','er'],['ɛɹ','er'],
  ['iː','i'],['uː','u'],['ɑː','ɑ'],['ɔː','ɔ'],['æː','æ'],['eː','e'],['tʃ','ch'],['dʒ','j'],['ŋg','ng'],['ŋ','ng'],['θ','th'],['ð','dh'],['ʃ','sh'],['ɹ','r'],['j','j'],['w','w'],['ỷ','ỷ'],['æ','æ'],['ɪ','ɪ'],['ɑ','ɑ'],['ɒ','ɒ'],['ɛ','ɛ'],['ʌ','ʌ'],['ʊ','ʊ'],['ə','ə']
]

const STRIP = new Set([...'/,.ˌːˑ'])
const VOWEL_FALLBACK = new Set([...'aeioujæɑɔəwɛɪʊʌyøœɒỷ'])

interface Seg { ipa: string; display: string; isVowel: boolean; accented: boolean }

function processIpa(word: string, rawIpa: string) {
  if (!rawIpa?.trim()) return [{ t: word, s: '', c: COLOR_SILENT, u: false, x: false }]
  const ipa = [...rawIpa].filter(c => !STRIP.has(c)).join('').trim()
  // Stress anchor rules per user's spec
  const stressAt = ipa.indexOf('ˈ')
  const clean = ipa.replace(/ˈ/g, '')
  let stressPos = -1
  if (stressAt >= 0) {
    let j = stressAt + 1
    const isVowelChar = (ch: string) => ch && VOWEL_CHARS.has(ch)
    if (j < ipa.length) {
      if (isVowelChar(ipa[j])) stressPos = j - 1
      else { let k = j; while (k < ipa.length && !isVowelChar(ipa[k])) k++; if (k < ipa.length) stressPos = k - 1 }
    }
  }
  const segs = segment(clean, stressPos)
  return mapToWord(word, segs)
}

function segment(clean: string, stressPos: number): Seg[] {
  const result: Seg[] = []
  let i = 0
  while (i < clean.length) {
    let matched = false
    for (const [pat, rep] of TRANSFORMS) {
      if (i + pat.length > clean.length) continue
      if (clean.slice(i, i + pat.length) !== pat) continue
      const accented = stressPos >= 0 && stressPos >= i && stressPos < i + pat.length
      result.push({ ipa: pat, display: rep, isVowel: isVowelSound(rep), accented })
      i += pat.length
      matched = true
      break
    }
    if (!matched) {
      const c = clean[i]
      const accented = stressPos === i
      const isVowel = VOWEL_FALLBACK.has(c.toLowerCase())
      result.push({ ipa: c, display: c, isVowel, accented })
      i++
    }
  }
  if (stressPos >= 0 && result.every(s => !s.accented)) {
    let cum = 0
    for (let k = 0; k < result.length; k++) {
      if (cum >= stressPos && result[k].isVowel) { result[k] = { ...result[k], accented: true }; break }
      cum += result[k].ipa.length
    }
  }
  return result
}

function isGraphicVowel(c: string) { return c && 'aeiouAEIOU'.includes(c) }
function isGraphicCons(c: string) { return !isGraphicVowel(c) }

function mapToWord(word: string, segs: Seg[]) {
  if (segs.length === 0) return [{ t: word, s: '', c: COLOR_SILENT, u: false, x: false }]
  const nodes: any[] = []
  let pos = 0
  const wLen = word.length
  for (const seg of segs) {
    const { ipa, display, isVowel, accented } = seg
    if (!display || display === '\u200d') { nodes.push({ t: '', s: display ?? '', c: COLOR_CONSONANT, u: false, x: true }); continue }
    let consumed = ''
    const SEMIVOWEL = new Set(['j','w','ỷ'])
    if (SEMIVOWEL.has(display)) {
      if (pos < wLen && isGraphicCons(word[pos])) consumed = word[pos++]
    } else if (isVowel) {
      const start = pos
      while (pos < wLen && isGraphicVowel(word[pos])) pos++
      consumed = word.slice(start, pos)
    } else {
      if (pos < wLen && isGraphicCons(word[pos])) {
        consumed = word[pos++]
        if (ipa.length >= 2 && pos < wLen && isGraphicCons(word[pos])) consumed += word[pos++]
      }
    }
    const color = getColor(display)
    const isStressed = accented && isVowel
    const isSilent = !color && !isVowel
    const isCons = !color && !isVowel
    nodes.push({ t: consumed, s: display, c: color ?? (isSilent ? COLOR_SILENT : COLOR_CONSONANT), u: isStressed, x: isCons || color === COLOR_CONSONANT })
  }
  if (pos < wLen) nodes.push({ t: word.slice(pos), s: '', c: COLOR_SILENT, u: false, x: false })
  return nodes
}

// Local copy of buildUnderlined logic for testing (no DOM)
function isVowelNode(n: any) {
  if (!n.t || n.t.length === 0) return false
  if (n.c === '#000000') return false
  if (n.c === '#000000') return false
  return true
}

function buildUnderlinedTest(nodes: any[], allow: boolean) {
  const result = new Set<number>()
  let i = 0
  while (i < nodes.length) {
    const n = nodes[i]
    const denied = n.underlineOverride === 'deny'
    const forced = n.underlineOverride === 'force'
    const isStressedVowel = !denied && n.u && isVowelNode(n)
    const isStressedSemi  = !denied && n.u && n.s && n.s.length > 0 && n.s !== '\u200d'
    if (forced || isStressedVowel || isStressedSemi) {
      if (!denied) result.add(i)
      let j = i + 1
      while (j < nodes.length) {
        const next = nodes[j]
        if (next.underlineOverride === 'deny') break
        if (next.underlineOverride === 'force' || isVowelNode(next)) {
          result.add(j)
          j++
        } else break
      }
      i = j
    } else i++
  }
  return result
}

function show(word: string, ipa: string) {
  const nodes = processIpa(word, ipa)
  const under = buildUnderlinedTest(nodes, true)
  // compute run anchor colours
  const runs: { indices: number[]; color: string }[] = []
  let runStart: number | null = null
  for (let i = 0; i <= nodes.length; i++) {
    const hit = i < nodes.length && under.has(i)
    if (hit && runStart === null) runStart = i
    if ((!hit || i === nodes.length) && runStart !== null) {
      const anchor = runStart
      // pick first real vowel in the run as anchor colour (match WordRenderer)
      let anchorColor = undefined
      for (let k = runStart; k < i; k++) {
        const rn = nodes[k]
        const isVowel = rn.t && rn.t.length > 0 && rn.c !== '#000000' && rn.c !== '' && !rn.x
        if (isVowel) { anchorColor = rn.c; break }
      }
      if (!anchorColor) anchorColor = nodes[anchor].c || '#000000'
      const idxs: number[] = []
      for (let j = runStart; j < i; j++) idxs.push(j)
      runs.push({ indices: idxs, color: anchorColor })
      runStart = null
    }
  }

  console.log('WORD:', word, 'IPA:', ipa)
  console.table(nodes.map((n, i) => ({ i, t: n.t, s: n.s, c: n.c, u: n.u })))
  console.log('Underlined indices:', Array.from(under.values()))
  console.log('Runs:', runs)
  console.log('---')
}

const cases: [string, string][] = [
  ['rain', 'ˈreɪn'],
  ['about', 'əˈbaʊt'],
  ['banana', 'bəˈnænə'],
  ['stress', 'ˈstrɛs'],
  ['create', 'kriˈeɪt'],
  ['question', "ˈkwɛs.tʃən"],
  ['beauty', "ˈbjuːti"],
  ['power', "ˈpaʊər"],
]

for (const [w, ipa] of cases) show(w, ipa)

// End
