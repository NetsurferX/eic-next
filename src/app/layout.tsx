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

// Site-ul începe cu animația vulpii (public/intro.html): la prima intrare din sesiune,
// pe orice pagină (în afară de /debug), se merge întâi la animație; după ea, înapoi unde voia utilizatorul.
const INTRO_REDIRECT = `(function(){try{var p=location.pathname;if(p.indexOf('/debug')===0||p==='/intro.html')return;if(!sessionStorage.getItem('eic_intro_seen')){sessionStorage.setItem('eic_after_intro',p+location.search);location.replace('/intro.html')}}catch(e){}})();`

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
