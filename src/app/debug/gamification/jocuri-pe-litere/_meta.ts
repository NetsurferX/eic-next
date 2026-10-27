// Metadate pentru cele 25 de jocuri-pe-literă (câte unul pentru fiecare
// coloană din LEVELS). `id` = Lesson.id din src/lib/levels.ts.
// Doar text — fără JSX — ca să poată fi importat și din pagina-index.

export interface GameMeta {
  id: string       // = Lesson.id
  emoji: string
  title: string
  tag: string      // tipul mecanicii
  mechanic: string // o frază: ce faci în joc
}

export const GAMES: GameMeta[] = [
  { id: 'a',          emoji: '🎈', title: 'Balonul',            tag: 'Reflex · țintă mobilă',  mechanic: 'Baloane urcă; le spargi doar pe cele cu cuvinte care au sunetul.' },
  { id: 'e',          emoji: '🃏', title: 'Perechi',            tag: 'Memorie',                mechanic: 'Întorci cărți: potrivești cuvântul cu literele care poartă sunetul.' },
  { id: 'o',          emoji: '🧺', title: 'Coșul de paie',      tag: 'Arcade · mișcare',       mechanic: 'Cuvinte cad; muți coșul și prinzi doar cuvintele cu sunetul.' },
  { id: 'i',          emoji: '👍', title: 'Da / Nu rapid',      tag: 'Decizie binară',         mechanic: 'Un cuvânt apare — are sunetul sau nu? Două butoane mari.' },
  { id: 'ae',         emoji: '🔍', title: 'Literele colorate',  tag: 'Analiză grafem',         mechanic: 'Bifezi literele din cuvânt care poartă sunetul; apoi se colorează.' },
  { id: 'u',          emoji: '🎧', title: 'Dictare',            tag: 'Ascultare',              mechanic: 'Auzi un cuvânt (Web Speech) și îl alegi dintre trei scrise.' },
  { id: 'ou',         emoji: '🏗️', title: 'Turnul',            tag: 'Construcție · vieți',    mechanic: 'Alegi între 2 cuvinte; răspunsul corect adaugă un bloc, greșeala dărâmă unul.' },
  { id: 'ei',         emoji: '🔤', title: 'Litere amestecate',  tag: 'Ortografie',             mechanic: 'Atingi literele în ordinea corectă ca să refaci cuvântul.' },
  { id: 'ju',         emoji: '🪢', title: 'Spânzurătoarea',     tag: 'Ghicit litere',          mechanic: 'Ghiceşti litere până apare cuvântul; sunetul se colorează pe măsură ce apare.' },
  { id: 'ai',         emoji: '🐇', title: 'Cursa cu iepurele',  tag: 'Cursă · timp',           mechanic: 'Fiecare răspuns corect te avansează; iepurele aleargă singur.' },
  { id: 'au',         emoji: '🐹', title: 'Cârtița',            tag: 'Reflex · grilă 3×3',     mechanic: 'Cuvinte răsar din găuri pentru o clipă; lovești doar pe cele cu sunetul.' },
  { id: 'oi',         emoji: '🕵️', title: 'Intrusul',          tag: 'Excludere',              mechanic: 'Patru cuvinte: trei au sunetul, unul nu. Găsește intrusul.' },
  { id: 'sh',         emoji: '🧩', title: 'Litera lipsă',       tag: 'Completare',             mechanic: 'Cuvântul are un gol; alegi grupul de litere care îl completează.' },
  { id: 'ch',         emoji: '🎯', title: 'Bingo',              tag: 'Căutare',                mechanic: 'Grilă 3×3: bifezi toate cuvintele cu sunetul, fără greșeli.' },
  { id: 'dj',         emoji: '🔢', title: 'Numără-le',          tag: 'Atenție · numărare',     mechanic: 'Cuvinte clipesc pe rând; spui câte aveau sunetul.' },
  { id: 'th',         emoji: '⚡', title: 'Reflexul',           tag: 'Go / No-go',             mechanic: 'Apeși „ACUM!” doar când cuvântul are sunetul; altfel te abții.' },
  { id: 'syllabic-lm',emoji: '🌫️', title: 'Ceața',             tag: 'Descoperire limitată',   mechanic: 'Plăci acoperite, buget de întoarceri: găsește toate cuvintele cu sunetul.' },
  { id: 'dot-z',      emoji: '⌨️', title: 'Dactilo',            tag: 'Tastare · cronometru',   mechanic: 'Scrii cuvintele de la tastatură cât mai repede în 45 de secunde.' },
  { id: 'ring-gz',    emoji: '🎵', title: 'Simon',              tag: 'Memorie secvențială',    mechanic: 'Urmărești o secvență de cuvinte și o repeți; fiecare rundă e mai lungă.' },
  { id: 'd-hat',      emoji: '🧲', title: 'Trage în coșuri',    tag: 'Sortare · drag & drop',  mechanic: 'Tragi fiecare cuvânt în coșul „are sunetul” sau „nu are”.' },
  { id: 'c-hook',     emoji: '🎰', title: 'Rămâi sau retrage-te', tag: 'Risc · bancă',         mechanic: 'Seria de răspunsuri corecte crește potul; îl pui la bancă înainte să greșești.' },
  { id: 'gh-ph-f',    emoji: '🥊', title: 'Duelul cu vulpea',   tag: 'Pe ture · adversar',     mechanic: 'Pe rând, tu și vulpea luați cuvinte de pe masă; cine ia cele corecte câștigă.' },
  { id: 'zh',         emoji: '🎨', title: 'Din culoare, în cuvânt', tag: 'Asociere inversă',   mechanic: 'Vezi culoarea sunetului și alegi cuvântul care o poartă.' },
  { id: 'strut',      emoji: '📏', title: 'Bara de putere',     tag: 'Răspuns + timing',       mechanic: 'Răspunzi corect, apoi oprești bara în zona verde pentru bonus.' },
  { id: 'rotic-o',    emoji: '🪨', title: 'Pietre peste râu',   tag: 'Drum cu alegeri',        mechanic: 'La fiecare pas sunt două pietre; una ține, cealaltă te aruncă în apă.' },
]
