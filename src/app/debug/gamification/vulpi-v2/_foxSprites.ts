// Manifest pentru noul set de vulpi (public/mascot/v2/). Date pure, fără
// dependențe — nu înlocuiește nimic din Mascot.tsx / public/mascot/*.png.

export type FoxSpriteId =
  | 'idleSide' | 'blink' | 'idleFront' | 'sit' | 'point' | 'wave'
  | 'clap' | 'cheerStars' | 'runA' | 'runB' | 'celebrateStars' | 'sleep'

export interface FoxSprite {
  id: FoxSpriteId
  src: string
  label: string
  /** Situația de joc (din spec „jocul vulpii”) în care se potrivește */
  usage: string
}

export const FOX_SPRITES: FoxSprite[] = [
  { id: 'idleSide',       src: '/mascot/v2/01_idle_side.png',       label: 'Stă, din profil',   usage: 'Repaus în timpul rundei' },
  { id: 'blink',          src: '/mascot/v2/02_idle_blink.png',      label: 'Clipește',          usage: 'Cadru de clipit pentru repaus (alternat cu idleSide)' },
  { id: 'idleFront',      src: '/mascot/v2/03_idle_front.png',      label: 'Din față, gura deschisă', usage: 'Rostește sunetul / deschide gura la primirea balonului' },
  { id: 'sit',            src: '/mascot/v2/04_idle_sit.png',        label: 'Așezată',           usage: 'Așteptare, ecran de start, după greșeală' },
  { id: 'point',          src: '/mascot/v2/05_point.png',           label: 'Arată',             usage: 'Ajutor: arată butonul corect' },
  { id: 'wave',           src: '/mascot/v2/06_wave.png',            label: 'Salută',            usage: 'Început de joc / propune sunetul' },
  { id: 'clap',           src: '/mascot/v2/07_clap.png',            label: 'Aplaudă',           usage: 'Apăsare corectă' },
  { id: 'cheerStars',     src: '/mascot/v2/08_cheer_stars.png',     label: 'Sare, stele',       usage: 'Prag 80% depășit — salt de victorie' },
  { id: 'runA',           src: '/mascot/v2/09_run_left.png',        label: 'Aleargă (cadru A)', usage: 'Mișcare orizontală, cadru 1' },
  { id: 'runB',           src: '/mascot/v2/10_run_right.png',       label: 'Aleargă (cadru B)', usage: 'Mișcare orizontală, cadru 2' },
  { id: 'celebrateStars', src: '/mascot/v2/11_celebrate_stars.png', label: 'Sărbătorește',      usage: 'Final de nivel / insignă câștigată' },
  { id: 'sleep',          src: '/mascot/v2/12_sleep.png',           label: 'Doarme',            usage: 'Pauză / jucătorul inactiv' },
]

export const FOX_BY_ID = Object.fromEntries(
  FOX_SPRITES.map(s => [s.id, s]),
) as Record<FoxSpriteId, FoxSprite>
