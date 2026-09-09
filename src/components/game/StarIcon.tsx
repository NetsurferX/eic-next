// components/game/StarIcon.tsx
//
// Înlocuiește glifa text „★" (U+2605) folosită anterior peste tot pentru
// stele — colțurile unui glyph de font sunt mereu ascuțite, indiferent de
// font, deci nu exista nicio cale CSS de a le "rotunji". Aici desenăm noi
// forma: un poligon de 5 colțuri (10 vârfuri alternând exterior/interior),
// unde fiecare vârf e control-point pentru o curbă Q către mijlocul
// segmentului următor — trucul standard pentru un "rounded polygon", aici
// aplicat unei stele (efect "puffy star", plăcut pentru o aplicație
// pentru copii, cf. cerinței "mai drăguțe, poate mai rotunjite").
//
// Dimensionare: width/height = 1em, deci moștenește exact `font-size`-ul
// clasei CSS existente pe elementul-părinte (.lesson-star-icon, .pop-star,
// .mascot-reward-pouring-stars span etc.) — zero schimbări de layout la
// locurile de folosire. Culoare: fill="currentColor", deci moștenește
// `color` exact ca glifa text pe care o înlocuiește. Umbrele foloseau
// `text-shadow`, care nu se aplică formelor SVG — locurile care aveau
// nevoie de glow au fost migrate la `filter: drop-shadow(...)` (vezi
// globals.css, regulile .lesson-star-slot.is-filled și
// .mascot-reward-pouring-stars span).

interface StarIconProps {
  className?: string
}

const ROUNDED_STAR_PATH =
  'M 10.80,5.34 Q 12.00,2.00 13.20,5.34 Q 14.41,8.68 17.96,8.80 ' +
  'Q 21.51,8.91 18.70,11.09 Q 15.90,13.27 16.89,16.68 Q 17.88,20.09 14.94,18.10 ' +
  'Q 12.00,16.10 9.06,18.10 Q 6.12,20.09 7.11,16.68 Q 8.10,13.27 5.30,11.09 ' +
  'Q 2.49,8.91 6.04,8.80 Q 9.59,8.68 10.80,5.34 Z'

export function StarIcon({ className }: StarIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      className={className}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path d={ROUNDED_STAR_PATH} fill="currentColor" />
    </svg>
  )
}
