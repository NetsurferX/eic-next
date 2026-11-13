'use client'

import { speakWord, warmUpVoices } from '@/lib/speak'
import { playStarChime, playLevelFanfare } from '@/lib/sound'
import { LEVELS as ALL_LEVELS, STORAGE_KEY, REPS_PER_LESSON, type SavedProgress, type Level, type Lesson, type LessonWord, type Accent } from '@/lib/levels'
import { Cup, Confetti } from '@/components/game/Cup'
import { Mascot } from '@/components/game/Mascot'
import MascotReward, { useMascotReward } from '@/components/game/MascotReward'
import { FoxHelper, type FoxTip, type FoxMood } from '@/components/game/FoxHelper'
import { useState, useCallback, useEffect, useRef, useMemo, type CSSProperties } from 'react'
import Link from 'next/link'
import { tricolorLetterStyle, TRICOLOR_UNDERLINE_COLOR, TRICOLOR_BANDS, TRICOLOR_CSS_HORIZONTAL } from '@/lib/tricolorStyle'
import WordRenderer from '@/components/WordRenderer'
import { OnboardingSoundIntro } from '@/components/game/OnboardingSoundIntro'
import { MascotIntro } from '@/components/game/MascotIntro'
import { FoxReel, FACE_IDLE_REEL, FACE_SPEAK_REEL } from '@/components/game/useFrameCycle'
import { StarIcon } from '@/components/game/StarIcon'
import { symbolView, WHITE_OUTLINED_TEXT_STYLE, CONSONANT_IDS, CONSONANT_BLACK } from '@/lib/symbolDisplay'
import type { RenderNode } from '@/lib/renderNode'
import { BuleleVulpiiOverlay, type BuleleVulpiiOverlayConfig } from '@/components/game/BuleleVulpiiOverlay'

// TEMPORARY STUB - full restore in progress
export default function LearnPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Learn</h1>
      <p>Restaurare în curs…</p>
    </main>
  )
}
