// src/app/debug/live/_useLiveTrace.ts
//
// Shared hook for the /debug/live/* concept wireframes. Listens on the
// SAME BroadcastChannel already used by /debug/graph's PipelineTraceGraph
// (see lib/pipelineTrace.ts) — purely additive, read-only, does not touch
// that file or WordRenderer.tsx.

"use client";

import { useEffect, useState } from "react";
import {
  PIPELINE_TRACE_CHANNEL,
  type PipelineTraceEvent,
} from "@/lib/pipelineTrace";

export function useLiveTrace(maxHistory = 30) {
  const [history, setHistory] = useState<PipelineTraceEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(PIPELINE_TRACE_CHANNEL);
    ch.onmessage = (ev: MessageEvent<PipelineTraceEvent>) => {
      setConnected(true);
      setHistory((prev) => [...prev, ev.data].slice(-maxHistory));
    };
    return () => ch.close();
  }, [maxHistory]);

  return { history, connected, latest: history[history.length - 1] ?? null };
}

export const LIVE_HINT =
  "deschide /learn sau / în alt tab și scrie/joacă — se actualizează aici automat";
