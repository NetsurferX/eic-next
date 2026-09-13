// src/app/debug/live/_useLiveTrains.ts
//
// Extension of the harta-metrou concept: tracks MULTIPLE concurrent
// "trains" (one per active word), each pinned to a free lane, instead of
// just the single latest event shown by _useLiveTrace.ts. Built on the
// same foundation (PIPELINE_TRACE_CHANNEL / PipelineTraceEvent from
// lib/pipelineTrace.ts) — still purely read-only, still does not touch
// pipelineTrace.ts or WordRenderer.tsx.
//
// Lifecycle per word:
//   1. First event for a new word  -> claims the first free lane (0..5)
//   2. Subsequent events           -> just update that word's stage
//      (this is what makes the train visibly slide between stations)
//   3. No event for TTL_MS         -> train is dropped, its lane freed
//   4. Last (TTL_MS - FADE_MS)ms   -> `fading: true`, so the page can
//      transition opacity to 0 instead of popping out abruptly

"use client";

import { useEffect, useRef, useState } from "react";
import {
  PIPELINE_TRACE_CHANNEL,
  type PipelineStageId,
  type PipelineTraceEvent,
} from "@/lib/pipelineTrace";

const TTL_MS = 1800;
const FADE_MS = 400;
export const MAX_LANES = 6;
const TICK_MS = 150;

export interface LiveTrain {
  word: string;
  stage: PipelineStageId;
  laneIndex: number;
  fading: boolean;
}

interface TrainInternal {
  word: string;
  stage: PipelineStageId;
  laneIndex: number;
  lastSeenAt: number;
}

export function useLiveTrains() {
  const [connected, setConnected] = useState(false);
  const [trains, setTrains] = useState<LiveTrain[]>([]);
  const trainsRef = useRef<Map<string, TrainInternal>>(new Map());

  function nextFreeLane(): number | null {
    const used = new Set<number>();
    trainsRef.current.forEach((t) => used.add(t.laneIndex));
    for (let i = 0; i < MAX_LANES; i++) {
      if (!used.has(i)) return i;
    }
    return null; // la plafon — cuvântul nu primește tren vizual, dar nu blocăm nimic la sursă
  }

  function publish() {
    const now = Date.now();
    const list: LiveTrain[] = [];
    trainsRef.current.forEach((t) => {
      list.push({
        word: t.word,
        stage: t.stage,
        laneIndex: t.laneIndex,
        fading: now - t.lastSeenAt > TTL_MS - FADE_MS,
      });
    });
    list.sort((a, b) => a.laneIndex - b.laneIndex);
    setTrains(list);
  }

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const ch = new BroadcastChannel(PIPELINE_TRACE_CHANNEL);
    ch.onmessage = (ev: MessageEvent<PipelineTraceEvent>) => {
      setConnected(true);
      const { word, stage } = ev.data;
      const existing = trainsRef.current.get(word);
      if (existing) {
        existing.stage = stage;
        existing.lastSeenAt = Date.now();
      } else {
        const lane = nextFreeLane();
        if (lane === null) return;
        trainsRef.current.set(word, { word, stage, laneIndex: lane, lastSeenAt: Date.now() });
      }
      publish();
    };

    const tick = setInterval(() => {
      const now = Date.now();
      let removed = false;
      trainsRef.current.forEach((t, key) => {
        if (now - t.lastSeenAt > TTL_MS) {
          trainsRef.current.delete(key);
          removed = true;
        }
      });
      // republicăm mereu (nu doar la removed) ca să recalculăm `fading`
      // în timp real, chiar dacă nu a fost șters niciun tren încă
      if (trainsRef.current.size > 0 || removed) publish();
    }, TICK_MS);

    return () => {
      ch.close();
      clearInterval(tick);
    };
  }, []);

  return { trains, connected };
}
