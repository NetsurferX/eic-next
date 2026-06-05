'use client'

import { useEffect, useRef, useMemo } from 'react'
import type { TextToken } from '@/lib/useColorizer'
import { COLOR_SILENT, COLOR_CONSONANT } from '@/lib/renderNode'

interface Props {
  tokens: TextToken[]
}

interface WordNode {
  word:   string
  color:  string
  freq:   number  // how many times it appears
  size:   number  // radius
  x?:     number
  y?:     number
  vx?:    number
  vy?:    number
  fx?:    number | null
  fy?:    number | null
}

export default function ConstellationView({ tokens }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  const nodes = useMemo<WordNode[]>(() => {
    const freq  = new Map<string, { color: string; count: number }>()

    for (const tok of tokens) {
      if (!tok.isWord || !tok.nodes) continue
      const lower = tok.raw.toLowerCase()

      // Dominant vowel colour
      const colorCounts = new Map<string, number>()
      for (const n of tok.nodes) {
        if (n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT && n.t.length > 0)
          colorCounts.set(n.c, (colorCounts.get(n.c) ?? 0) + 1)
      }
      const dominant = [...colorCounts.entries()].sort((a, b) => b[1] - a[1])[0]
      const color = dominant?.[0] ?? '#000000'

      const existing = freq.get(lower)
      if (existing) existing.count++
      else freq.set(lower, { color, count: 1 })
    }

    return [...freq.entries()].map(([word, { color, count }]) => ({
      word,
      color,
      freq:  count,
      size:  Math.max(14, Math.min(40, 12 + count * 6 + word.length * 1.5)),
    }))
  }, [tokens])

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return

    // Dynamic D3 import — client only
    import('d3').then(d3 => {
      const svg = d3.select(svgRef.current!)
      svg.selectAll('*').remove()

      const W = svgRef.current!.clientWidth  || 700
      const H = svgRef.current!.clientHeight || 420

      const sim = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
        .force('charge', d3.forceManyBody().strength(-120))
        .force('center',  d3.forceCenter(W / 2, H / 2).strength(0.08))
        .force('collide',
          d3.forceCollide<WordNode>(d => d.size + 6).strength(0.8)
        )
        .alphaDecay(0.02)

      const g = svg.append('g')

      // Subtle connecting lines between frequent words
      const topWords = [...nodes].sort((a, b) => b.freq - a.freq).slice(0, 6)
      const linkData: { source: WordNode; target: WordNode }[] = []
      for (let i = 0; i < topWords.length - 1; i++)
        linkData.push({ source: topWords[i], target: topWords[i + 1] })

      const links = g.selectAll('line')
        .data(linkData)
        .enter()
        .append('line')
        .attr('stroke', '#e8e6e1')
        .attr('stroke-width', 1)

      // Node groups
      const nodeG = g.selectAll('g.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .style('cursor', 'pointer')
        .call(
          d3.drag<SVGGElement, WordNode>()
            .on('start', (event, d) => {
              if (!event.active) sim.alphaTarget(0.3).restart()
              d.fx = d.x; d.fy = d.y
            })
            .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
            .on('end', (event, d) => {
              if (!event.active) sim.alphaTarget(0)
              d.fx = null; d.fy = null
            })
        )

      // Circle
      nodeG.append('circle')
        .attr('r', d => d.size)
        .attr('fill', d => d.color + '22')
        .attr('stroke', d => d.color)
        .attr('stroke-width', d => d.freq > 1 ? 2.5 : 1.5)

      // Word label
      nodeG.append('text')
        .text(d => d.word)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', d => Math.max(10, Math.min(15, d.size * 0.55)))
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-weight', d => d.freq > 1 ? '600' : '400')
        .attr('fill', d => d.color)

      // Frequency badge
      nodeG.filter(d => d.freq > 1)
        .append('text')
        .text(d => `×${d.freq}`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('dy', d => d.size * 0.55)
        .attr('font-size', 9)
        .attr('font-family', 'Inter, sans-serif')
        .attr('fill', d => d.color)
        .attr('opacity', 0.7)

      // Hover effect
      nodeG
        .on('mouseenter', function(_, d) {
          d3.select(this).select('circle')
            .attr('fill', d.color + '44')
            .attr('stroke-width', 3)
        })
        .on('mouseleave', function(_, d) {
          d3.select(this).select('circle')
            .attr('fill', d.color + '22')
            .attr('stroke-width', d.freq > 1 ? 2.5 : 1.5)
        })

      // Tick
      sim.on('tick', () => {
        nodeG.attr('transform', d =>
          `translate(${Math.max(d.size, Math.min(W - d.size, d.x ?? W/2))},${
            Math.max(d.size, Math.min(H - d.size, d.y ?? H/2))})`
        )
        links
          .attr('x1', d => (d.source as WordNode).x ?? 0)
          .attr('y1', d => (d.source as WordNode).y ?? 0)
          .attr('x2', d => (d.target as WordNode).x ?? 0)
          .attr('y2', d => (d.target as WordNode).y ?? 0)
      })
    })
  }, [nodes])

  return (
    <div className="constellation-wrap">
      <div className="terrain-header">
        <span className="terrain-title">Word Constellation</span>
        <span className="terrain-sub">
          Size = frequency · Colour = dominant vowel sound · Drag to explore
        </span>
      </div>
      {nodes.length === 0
        ? <div className="terrain-empty">Paste text above to see the constellation.</div>
        : <svg ref={svgRef} className="constellation-svg" />
      }
    </div>
  )
}
