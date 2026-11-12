'use client'

import { FoxMotion } from '@/components/game/FoxMotion'

// API-ul istoric este păstrat pentru toate componentele EiC.
// Mascota de învățare, recompensa cu stele/cupe și pescuitul folosesc
// acum același set de cadre v2 și același limbaj de mișcare.
export type MascotState = 'idle' | 'pointing' | 'clapping' | 'cheering' | 'talking'
export type MascotFace = 'smile' | 'laugh' | 'surprised' | 'thinking' | 'wink'
export type MascotAction =
  | 'idle'
  | 'walking'
  | 'grabbing'
  | 'holding-star'
  | 'holding-cup'
  | 'pouring'
  | 'celebrating'

export function Mascot({
  state = 'idle',
  action,
  face,
  message = null,
  size = 96,
  className = '',
}: {
  state?: MascotState
  action?: MascotAction
  face?: MascotFace
  message?: string | null
  size?: number
  className?: string
}) {
  return <FoxMotion state={state} action={action} face={face} message={message} size={size} className={className} />
}

export default Mascot
