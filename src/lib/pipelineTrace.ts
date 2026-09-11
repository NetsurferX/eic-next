// src/lib/pipelineTrace.ts
//
// Lightweight side-channel for broadcasting "a pipeline stage just ran for
// this word" events from wherever the client-side pipeline actually
// executes (WordRenderer.tsx, in production, on /learn) to anyone listening
// (the live graph on /debug/graph). Uses BroadcastChannel — no server, no
// polling, cross-tab within the same browser/profile.
//
// SAFE BY DESIGN: no-ops entirely during SSR and whenever BroadcastChannel
// isn't available; emitPipelineStage() never throws, so it can never break
// an actual render. It does NOT alter nodes, colors, or any rendering
// decision — it only reports what already happened.

export type PipelineStageId =
  | 'syllabicConsonants'
  | 'syllabicR'
  | 'overrides'
  | 'resolveDisplay'

export const PIPELINE_STAGE_ORDER: PipelineStageId[] = [
  'syllabicConsonants',
  'syllabicR',
  'overrides',
  'resolveDisplay',
]

export interface PipelineTraceEvent {
  id: string
  word: string
  stage: PipelineStageId
  /** Did this stage actually change the nodes for this word, or pass them through untouched? */
  changed: boolean
  timestamp: number
}

export const PIPELINE_TRACE_CHANNEL = 'eic-pipeline-trace'

let channel: BroadcastChannel | null = null

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null
  if (!channel) {
    try {
      channel = new BroadcastChannel(PIPELINE_TRACE_CHANNEL)
    } catch {
      return null
    }
  }
  return channel
}

export function emitPipelineStage(word: string, stage: PipelineStageId, changed: boolean): void {
  const ch = getChannel()
  if (!ch) return
  const event: PipelineTraceEvent = {
    id: `${word}-${stage}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    word,
    stage,
    changed,
    timestamp: Date.now(),
  }
  try {
    ch.postMessage(event)
  } catch {
    // Never let telemetry break a real render.
  }
}

/** Cheap structural-change check — arrays here are always short (one word's worth of nodes). */
export function nodesDiffer(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) !== JSON.stringify(b)
  } catch {
    return false
  }
}
