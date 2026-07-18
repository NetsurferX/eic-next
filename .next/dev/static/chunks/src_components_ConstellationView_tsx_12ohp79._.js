(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ConstellationView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConstellationView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/renderNode.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/display.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function ConstellationView({ tokens }) {
    _s();
    const svgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const nodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ConstellationView.useMemo[nodes]": ()=>{
            const freq = new Map();
            for (const tok of tokens){
                if (!tok.isWord || !tok.nodes) continue;
                const lower = tok.raw.toLowerCase();
                // Dominant vowel colour
                const colorCounts = new Map();
                for (const n of tok.nodes){
                    if (n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.t.length > 0) colorCounts.set(n.c, (colorCounts.get(n.c) ?? 0) + 1);
                }
                const dominant = [
                    ...colorCounts.entries()
                ].sort({
                    "ConstellationView.useMemo[nodes]": (a, b)=>b[1] - a[1]
                }["ConstellationView.useMemo[nodes]"])[0];
                const color = dominant?.[0] ?? '#000000';
                const existing = freq.get(lower);
                if (existing) existing.count++;
                else freq.set(lower, {
                    color,
                    count: 1
                });
            }
            return [
                ...freq.entries()
            ].map({
                "ConstellationView.useMemo[nodes]": ([word, { color, count }])=>({
                        word,
                        color,
                        freq: count,
                        size: Math.max(14, Math.min(40, 12 + count * 6 + word.length * 1.5))
                    })
            }["ConstellationView.useMemo[nodes]"]);
        }
    }["ConstellationView.useMemo[nodes]"], [
        tokens
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ConstellationView.useEffect": ()=>{
            if (!svgRef.current || nodes.length === 0) return;
            // Dynamic D3 import — client only
            __turbopack_context__.A("[project]/node_modules/d3/src/index.js [app-client] (ecmascript, async loader)").then({
                "ConstellationView.useEffect": (d3)=>{
                    const svg = d3.select(svgRef.current);
                    svg.selectAll('*').remove();
                    const W = svgRef.current.clientWidth || 700;
                    const H = svgRef.current.clientHeight || 420;
                    const sim = d3.forceSimulation(nodes).force('charge', d3.forceManyBody().strength(-120)).force('center', d3.forceCenter(W / 2, H / 2).strength(0.08)).force('collide', d3.forceCollide({
                        "ConstellationView.useEffect.sim": (d)=>d.size + 6
                    }["ConstellationView.useEffect.sim"]).strength(0.8)).alphaDecay(0.02);
                    const g = svg.append('g');
                    // Subtle connecting lines between frequent words
                    const topWords = [
                        ...nodes
                    ].sort({
                        "ConstellationView.useEffect.topWords": (a, b)=>b.freq - a.freq
                    }["ConstellationView.useEffect.topWords"]).slice(0, 6);
                    const linkData = [];
                    for(let i = 0; i < topWords.length - 1; i++)linkData.push({
                        source: topWords[i],
                        target: topWords[i + 1]
                    });
                    const links = g.selectAll('line').data(linkData).enter().append('line').attr('stroke', '#e8e6e1').attr('stroke-width', 1);
                    // Node groups
                    const nodeG = g.selectAll('g.node').data(nodes).enter().append('g').attr('class', 'node').style('cursor', 'pointer').call(d3.drag().on('start', {
                        "ConstellationView.useEffect.nodeG": (event, d)=>{
                            if (!event.active) sim.alphaTarget(0.3).restart();
                            d.fx = d.x;
                            d.fy = d.y;
                        }
                    }["ConstellationView.useEffect.nodeG"]).on('drag', {
                        "ConstellationView.useEffect.nodeG": (event, d)=>{
                            d.fx = event.x;
                            d.fy = event.y;
                        }
                    }["ConstellationView.useEffect.nodeG"]).on('end', {
                        "ConstellationView.useEffect.nodeG": (event, d)=>{
                            if (!event.active) sim.alphaTarget(0);
                            d.fx = null;
                            d.fy = null;
                        }
                    }["ConstellationView.useEffect.nodeG"]));
                    // Circle
                    nodeG.append('circle').attr('r', {
                        "ConstellationView.useEffect": (d)=>d.size
                    }["ConstellationView.useEffect"]).attr('fill', {
                        "ConstellationView.useEffect": (d)=>d.color + '22'
                    }["ConstellationView.useEffect"]).attr('stroke', {
                        "ConstellationView.useEffect": (d)=>d.color
                    }["ConstellationView.useEffect"]).attr('stroke-width', {
                        "ConstellationView.useEffect": (d)=>d.freq > 1 ? 2.5 : 1.5
                    }["ConstellationView.useEffect"]);
                    // Word label
                    nodeG.append('text').text({
                        "ConstellationView.useEffect": (d)=>d.word
                    }["ConstellationView.useEffect"]).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-size', {
                        "ConstellationView.useEffect": (d)=>Math.max(10, Math.min(15, d.size * 0.55))
                    }["ConstellationView.useEffect"]).attr('font-family', 'Inter, sans-serif').attr('font-weight', {
                        "ConstellationView.useEffect": (d)=>d.freq > 1 ? '600' : '400'
                    }["ConstellationView.useEffect"]).attr('fill', {
                        "ConstellationView.useEffect": (d)=>d.color
                    }["ConstellationView.useEffect"]);
                    // Frequency badge
                    nodeG.filter({
                        "ConstellationView.useEffect": (d)=>d.freq > 1
                    }["ConstellationView.useEffect"]).append('text').text({
                        "ConstellationView.useEffect": (d)=>`×${d.freq}`
                    }["ConstellationView.useEffect"]).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('dy', {
                        "ConstellationView.useEffect": (d)=>d.size * 0.55
                    }["ConstellationView.useEffect"]).attr('font-size', 9).attr('font-family', 'Inter, sans-serif').attr('fill', {
                        "ConstellationView.useEffect": (d)=>d.color
                    }["ConstellationView.useEffect"]).attr('opacity', 0.7);
                    // Hover effect
                    nodeG.on('mouseenter', {
                        "ConstellationView.useEffect": function(_, d) {
                            d3.select(this).select('circle').attr('fill', d.color + '44').attr('stroke-width', 3);
                        }
                    }["ConstellationView.useEffect"]).on('mouseleave', {
                        "ConstellationView.useEffect": function(_, d) {
                            d3.select(this).select('circle').attr('fill', d.color + '22').attr('stroke-width', d.freq > 1 ? 2.5 : 1.5);
                        }
                    }["ConstellationView.useEffect"]);
                    // Tick
                    sim.on('tick', {
                        "ConstellationView.useEffect": ()=>{
                            nodeG.attr('transform', {
                                "ConstellationView.useEffect": (d)=>`translate(${Math.max(d.size, Math.min(W - d.size, d.x ?? W / 2))},${Math.max(d.size, Math.min(H - d.size, d.y ?? H / 2))})`
                            }["ConstellationView.useEffect"]);
                            links.attr('x1', {
                                "ConstellationView.useEffect": (d)=>d.source.x ?? 0
                            }["ConstellationView.useEffect"]).attr('y1', {
                                "ConstellationView.useEffect": (d)=>d.source.y ?? 0
                            }["ConstellationView.useEffect"]).attr('x2', {
                                "ConstellationView.useEffect": (d)=>d.target.x ?? 0
                            }["ConstellationView.useEffect"]).attr('y2', {
                                "ConstellationView.useEffect": (d)=>d.target.y ?? 0
                            }["ConstellationView.useEffect"]);
                        }
                    }["ConstellationView.useEffect"]);
                }
            }["ConstellationView.useEffect"]);
        }
    }["ConstellationView.useEffect"], [
        nodes
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "constellation-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "terrain-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "terrain-title",
                        children: "Word Constellation"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConstellationView.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "terrain-sub",
                        children: "Size = frequency · Colour = dominant vowel sound · Drag to explore"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConstellationView.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ConstellationView.tsx",
                lineNumber: 169,
                columnNumber: 7
            }, this),
            nodes.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "terrain-empty",
                children: "Paste text above to see the constellation."
            }, void 0, false, {
                fileName: "[project]/src/components/ConstellationView.tsx",
                lineNumber: 176,
                columnNumber: 11
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                ref: svgRef,
                className: "constellation-svg"
            }, void 0, false, {
                fileName: "[project]/src/components/ConstellationView.tsx",
                lineNumber: 177,
                columnNumber: 11
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ConstellationView.tsx",
        lineNumber: 168,
        columnNumber: 5
    }, this);
}
_s(ConstellationView, "/3dEWPDG9XEwVFsum6TxFmhMJ4Y=");
_c = ConstellationView;
var _c;
__turbopack_context__.k.register(_c, "ConstellationView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ConstellationView.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/ConstellationView.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_components_ConstellationView_tsx_12ohp79._.js.map