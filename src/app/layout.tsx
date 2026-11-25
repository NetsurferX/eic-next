import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'English in Colours',
  description: 'See English as it sounds — every grapheme coloured by its phoneme.',
}

// Site-ul începe cu animația vulpii (public/intro.html): la fiecare intrare pe site din afară
// (adresă scrisă, bookmark, link extern, tab nou) se merge întâi la animație, pe orice pagină
// în afară de /debug. Navigarea în interiorul site-ului (referrer de pe același domeniu) nu o repornește.
// După animație se merge unde voia utilizatorul (eic_after_intro).
const INTRO_REDIRECT = `(function(){try{var p=location.pathname;if(p.indexOf('/debug')===0||p==='/intro.html')return;var r=document.referrer,same=false;try{same=!!r&&new URL(r).origin===location.origin}catch(e){}if(same)return;sessionStorage.setItem('eic_after_intro',p+location.search);location.replace('/intro.html')}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_REDIRECT }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
