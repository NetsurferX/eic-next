module.exports = [
"[project]/src/app/learn/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LearnPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const LESSONS = [
    {
        id: 'a',
        ipaBig: '/a/',
        ipaSub: '/ɑ/',
        color: '#008E40',
        tabLabel: 'Verde',
        words: [
            'dark',
            'cart',
            'father',
            'star',
            'farm',
            'hard',
            'park',
            'calm'
        ]
    },
    {
        id: 'e',
        ipaBig: '/e/',
        ipaSub: '/ɛ/',
        color: '#EE5B00',
        tabLabel: 'Portocaliu',
        words: [
            'bed',
            'head',
            'said',
            'bread',
            'friend',
            'left',
            'best',
            'red'
        ]
    },
    {
        id: 'o',
        ipaBig: '/o/',
        ipaSub: '/ɔ/',
        color: '#FF3399',
        tabLabel: 'Roz',
        words: [
            'hot',
            'top',
            'stop',
            'clock',
            'dog',
            'box',
            'lot',
            'not'
        ]
    },
    {
        id: 'i',
        ipaBig: '/i/',
        ipaSub: '/ɪ/',
        color: '#CC0000',
        tabLabel: 'Roșu',
        words: [
            'sit',
            'tip',
            'big',
            'fish',
            'hit',
            'list',
            'ship',
            'wind'
        ]
    }
];
const STORAGE_KEY = 'eic-lesson-progress-v1';
const AUTO_DELAY_MS = 550 // gap between words in "Repetă tot" mode
;
function LearnPage() {
    const [unlocked, setUnlocked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        true,
        false,
        false,
        false
    ]);
    const [active, setActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [practiced, setPracticed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [playingWord, setPlayingWord] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [autoPlaying, setAutoPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [justCompleted, setJustCompleted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const hydrated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const audioCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map()) // word → object URL
    ;
    const autoCancel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // ── Restore progress from a previous visit ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setUnlocked(JSON.parse(raw));
        } catch  {}
        hydrated.current = true;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!hydrated.current) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
        } catch  {}
    }, [
        unlocked
    ]);
    const lesson = LESSONS[active];
    // ── Prefetch every word's audio for the active lesson so playback is instant ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        lesson.words.forEach(async (word)=>{
            if (audioCache.current.has(word)) return;
            try {
                const res = await fetch('/api/speak', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        word
                    })
                });
                if (!res.ok || cancelled) return;
                const blob = await res.blob();
                audioCache.current.set(word, URL.createObjectURL(blob));
            } catch  {}
        });
        return ()=>{
            cancelled = true;
        };
    }, [
        lesson
    ]);
    const playWord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (word)=>{
        setPlayingWord(word);
        try {
            let url = audioCache.current.get(word);
            if (!url) {
                const res = await fetch('/api/speak', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        word
                    })
                });
                if (res.ok) {
                    const blob = await res.blob();
                    url = URL.createObjectURL(blob);
                    audioCache.current.set(word, url);
                }
            }
            if (url) {
                const audio = new Audio(url);
                await audio.play();
                await new Promise((resolve)=>{
                    audio.onended = ()=>resolve();
                });
            }
        } catch  {}
        setPlayingWord(null);
        setPracticed((prev)=>prev.has(word) ? prev : new Set(prev).add(word));
    }, []);
    const selectLesson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((i)=>{
        if (!unlocked[i]) return;
        autoCancel.current = true;
        setAutoPlaying(false);
        setActive(i);
        setPracticed(new Set());
        setJustCompleted(false);
    }, [
        unlocked
    ]);
    const handleWordTap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((word)=>{
        if (playingWord || autoPlaying) return;
        playWord(word);
    }, [
        playingWord,
        autoPlaying,
        playWord
    ]);
    const toggleAutoPlay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (autoPlaying) {
            autoCancel.current = true;
            setAutoPlaying(false);
            return;
        }
        autoCancel.current = false;
        setAutoPlaying(true);
        for (const word of lesson.words){
            if (autoCancel.current) break;
            await playWord(word);
            if (autoCancel.current) break;
            await new Promise((r)=>setTimeout(r, AUTO_DELAY_MS));
        }
        setAutoPlaying(false);
    }, [
        autoPlaying,
        lesson,
        playWord
    ]);
    // ── Lesson-complete detection: every word practiced at least once ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (justCompleted) return;
        if (practiced.size > 0 && practiced.size === lesson.words.length) {
            setJustCompleted(true);
            setUnlocked((u)=>{
                if (active + 1 < LESSONS.length && !u[active + 1]) {
                    const copy = [
                        ...u
                    ];
                    copy[active + 1] = true;
                    return copy;
                }
                return u;
            });
        }
    }, [
        practiced,
        lesson,
        active,
        justCompleted
    ]);
    const allDone = unlocked.every(Boolean) && active === LESSONS.length - 1 && justCompleted;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "lesson-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "lesson-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "lesson-title",
                        children: "EiC · English in Color"
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "lesson-subhead",
                        children: [
                            "Antrenamentul Activ — Lecția ",
                            active + 1,
                            ": sunetele de bază"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 160,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "lesson-tabs",
                children: LESSONS.map((l, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `lesson-tab ${active === i ? 'active' : ''}`,
                        onClick: ()=>selectLesson(i),
                        disabled: !unlocked[i],
                        children: [
                            "Lecția ",
                            i + 1,
                            !unlocked[i] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "lesson-tab-lock",
                                children: "🔒"
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 171,
                                columnNumber: 44
                            }, this)
                        ]
                    }, l.id, true, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 165,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "lesson-grid",
                children: LESSONS.map((l, i)=>{
                    const isUnlocked = unlocked[i];
                    const isActive = active === i;
                    const style = {
                        '--lesson-color': l.color
                    };
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `lesson-col ${isUnlocked ? 'is-unlocked' : 'is-locked'} ${isActive && isUnlocked ? 'is-active' : ''}`,
                        style: style,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "lesson-col-head",
                                children: [
                                    !isUnlocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "lesson-lock",
                                        "aria-label": "blocat",
                                        children: "🔒"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 188,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "lesson-ipa-big",
                                        children: l.ipaBig
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 189,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "lesson-ipa-sub",
                                        children: l.ipaSub
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 190,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 187,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "lesson-words",
                                children: l.words.map((w)=>{
                                    const isPracticed = isActive && practiced.has(w);
                                    const isPlaying = isActive && playingWord === w;
                                    const tappable = isActive && isUnlocked && !autoPlaying;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: `lesson-word ${isPlaying ? 'is-playing' : ''} ${isPracticed ? 'is-practiced' : ''} ${tappable ? 'is-tappable' : ''}`,
                                        onClick: ()=>tappable && handleWordTap(w),
                                        disabled: !tappable,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: w
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/learn/page.tsx",
                                                lineNumber: 205,
                                                columnNumber: 23
                                            }, this),
                                            isPracticed && !isPlaying && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "lesson-word-check",
                                                children: "✓"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/learn/page.tsx",
                                                lineNumber: 206,
                                                columnNumber: 53
                                            }, this)
                                        ]
                                    }, w, true, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 198,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 192,
                                columnNumber: 15
                            }, this)
                        ]
                    }, l.id, true, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 182,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shadow-panel",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "shadow-title",
                        children: "Shadowing — atinge un cuvânt și repetă-l cu voce tare:"
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 217,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "shadow-tabs",
                        children: LESSONS.map((l, i)=>{
                            const style = {
                                '--tab-color': l.color
                            };
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: `shadow-tab ${active === i ? 'active' : ''}`,
                                style: style,
                                onClick: ()=>selectLesson(i),
                                disabled: !unlocked[i],
                                children: l.tabLabel
                            }, l.id, false, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 223,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `shadow-repeat-btn ${autoPlaying ? 'is-stop' : ''}`,
                        onClick: toggleAutoPlay,
                        children: autoPlaying ? '■ Oprește' : '🔀 Repetă tot'
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 236,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "shadow-count",
                        children: [
                            practiced.size,
                            " / ",
                            lesson.words.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 240,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "shadow-progress",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "shadow-progress-fill",
                            style: {
                                width: `${practiced.size / lesson.words.length * 100}%`
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/app/learn/page.tsx",
                            lineNumber: 242,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 241,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "shadow-caption",
                        children: allDone ? '🎉 Ai terminat toate lecțiile de bază!' : justCompleted ? `🎉 Lecție completă! Lecția ${active + 2} s-a deblocat.` : practiced.size === 0 ? 'Atinge orice cuvânt colorat ca să-l auzi și să-l repeți' : `Mai sunt ${lesson.words.length - practiced.size} cuvinte de repetat`
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 216,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/learn/page.tsx",
        lineNumber: 157,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=_06mkvoc._.js.map