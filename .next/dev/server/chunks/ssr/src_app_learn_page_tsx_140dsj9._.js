module.exports = [
"[project]/src/app/learn/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LearnPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
'use client';
;
;
;
const LESSONS = [
    {
        id: 'a',
        letter: 'a',
        color: '#008E40',
        tabLabel: 'Verde',
        words: [
            {
                text: 'dark',
                mark: 'ar'
            },
            {
                text: 'cart',
                mark: 'ar'
            },
            {
                text: 'father',
                mark: 'a'
            },
            {
                text: 'star',
                mark: 'ar'
            },
            {
                text: 'farm',
                mark: 'ar'
            },
            {
                text: 'hard',
                mark: 'ar'
            },
            {
                text: 'park',
                mark: 'ar'
            },
            {
                text: 'calm',
                mark: 'a'
            }
        ]
    },
    {
        id: 'e',
        letter: 'e',
        color: '#EE5B00',
        tabLabel: 'Portocaliu',
        words: [
            {
                text: 'bed',
                mark: 'e'
            },
            {
                text: 'head',
                mark: 'ea'
            },
            {
                text: 'said',
                mark: 'ai'
            },
            {
                text: 'bread',
                mark: 'ea'
            },
            {
                text: 'friend',
                mark: 'ie'
            },
            {
                text: 'left',
                mark: 'e'
            },
            {
                text: 'best',
                mark: 'e'
            },
            {
                text: 'red',
                mark: 'e'
            }
        ]
    },
    {
        id: 'o',
        letter: 'o',
        color: '#FF3399',
        tabLabel: 'Roz',
        words: [
            {
                text: 'hot',
                mark: 'o'
            },
            {
                text: 'top',
                mark: 'o'
            },
            {
                text: 'stop',
                mark: 'o'
            },
            {
                text: 'clock',
                mark: 'o'
            },
            {
                text: 'dog',
                mark: 'o'
            },
            {
                text: 'box',
                mark: 'o'
            },
            {
                text: 'lot',
                mark: 'o'
            },
            {
                text: 'not',
                mark: 'o'
            }
        ]
    },
    {
        id: 'i',
        letter: 'i',
        color: '#CC0000',
        tabLabel: 'Roșu',
        words: [
            {
                text: 'sit',
                mark: 'i'
            },
            {
                text: 'tip',
                mark: 'i'
            },
            {
                text: 'big',
                mark: 'i'
            },
            {
                text: 'fish',
                mark: 'i'
            },
            {
                text: 'hit',
                mark: 'i'
            },
            {
                text: 'list',
                mark: 'i'
            },
            {
                text: 'ship',
                mark: 'i'
            },
            {
                text: 'wind',
                mark: 'i'
            }
        ]
    }
];
const STORAGE_KEY = 'eic-lesson-progress-v2';
const AUTO_DELAY_MS = 550 // gap between words
;
const TROPHY_PAUSE_MS = 900 // pause on a column's trophy before moving to the next one
;
const REPS_PER_LESSON = 5;
// Renders a word so that only the letters carrying the target sound get colour;
// everything else stays black.
function MarkedWord({ text, mark }) {
    const idx = text.toLowerCase().indexOf(mark.toLowerCase());
    if (idx === -1) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: text
    }, void 0, false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            text.slice(0, idx),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "lesson-word-mark",
                children: text.slice(idx, idx + mark.length)
            }, void 0, false, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            text.slice(idx + mark.length)
        ]
    }, void 0, true);
}
function LearnPage() {
    const [unlocked, setUnlocked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        true,
        false,
        false,
        false
    ]);
    const [trophies, setTrophies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        false,
        false,
        false,
        false
    ]);
    const [active, setActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [currentRep, setCurrentRep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0) // 0 = not currently running a rep
    ;
    const [starsThisRun, setStarsThisRun] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        0,
        0,
        0,
        0
    ]);
    const [playingWord, setPlayingWord] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isRunning, setIsRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [justCompleted, setJustCompleted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const hydrated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const audioCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map()) // word → object URL
    ;
    const autoCancel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const currentAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null) // lets us silence playback instantly
    ;
    const repRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0) // rep in progress when stopped — 0 = nothing in progress
    ;
    const wordIdxRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0) // word index in progress within that rep
    ;
    // ── Restore progress from a previous visit ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (saved.unlocked) setUnlocked(saved.unlocked);
                if (saved.trophies) setTrophies(saved.trophies);
            }
        } catch  {}
        hydrated.current = true;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!hydrated.current) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                unlocked,
                trophies
            }));
        } catch  {}
    }, [
        unlocked,
        trophies
    ]);
    // ── Safety net: leaving the page any other way (back button, another link) also stops playback ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            autoCancel.current = true;
            currentAudio.current?.pause();
        };
    }, []);
    const lesson = LESSONS[active];
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
                currentAudio.current = audio;
                await audio.play();
                await new Promise((resolve)=>{
                    const done = ()=>resolve();
                    audio.addEventListener('ended', done, {
                        once: true
                    });
                    audio.addEventListener('pause', done, {
                        once: true
                    }); // fires when we stop the game mid-word
                });
                if (currentAudio.current === audio) currentAudio.current = null;
            }
        } catch  {}
        setPlayingWord(null);
    }, []);
    // ── Main automatic sequence: for every column, play the word list five times,
    //    one star per completed pass, a trophy — and the next column — once all five are done.
    //    Resumes exactly where a previous "Oprește" left off (same rep, same word). ──
    const startGame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (isRunning) return;
        autoCancel.current = false;
        setIsRunning(true);
        setJustCompleted(null);
        const resumeLessonIdx = active;
        let firstLesson = true;
        for(let lessonIdx = resumeLessonIdx; lessonIdx < LESSONS.length; lessonIdx++){
            if (autoCancel.current) break;
            setActive(lessonIdx);
            const currentLesson = LESSONS[lessonIdx];
            // Only the lesson we were stopped on resumes mid-way; every lesson after starts clean.
            const resuming = firstLesson && repRef.current > 0;
            let repStart = resuming ? repRef.current : 1;
            let wordStart = resuming ? wordIdxRef.current : 0;
            firstLesson = false;
            if (!resuming) {
                setCurrentRep(0);
                setStarsThisRun((prev)=>{
                    const copy = [
                        ...prev
                    ];
                    copy[lessonIdx] = 0;
                    return copy;
                });
            }
            for(let rep = repStart; rep <= REPS_PER_LESSON; rep++){
                if (autoCancel.current) break;
                repRef.current = rep;
                setCurrentRep(rep);
                for(let wi = wordStart; wi < currentLesson.words.length; wi++){
                    if (autoCancel.current) break;
                    wordIdxRef.current = wi;
                    await playWord(currentLesson.words[wi].text);
                    if (autoCancel.current) break;
                    await new Promise((res)=>setTimeout(res, AUTO_DELAY_MS));
                    if (autoCancel.current) break;
                    wordIdxRef.current = wi + 1;
                }
                wordStart = 0;
                if (autoCancel.current) break;
                wordIdxRef.current = 0;
                setStarsThisRun((prev)=>{
                    const copy = [
                        ...prev
                    ];
                    copy[lessonIdx] = rep;
                    return copy;
                });
            }
            if (autoCancel.current) break;
            repRef.current = 0;
            wordIdxRef.current = 0;
            setTrophies((prev)=>{
                const copy = [
                    ...prev
                ];
                copy[lessonIdx] = true;
                return copy;
            });
            setJustCompleted(lessonIdx);
            setUnlocked((prev)=>{
                if (lessonIdx + 1 < LESSONS.length && !prev[lessonIdx + 1]) {
                    const copy = [
                        ...prev
                    ];
                    copy[lessonIdx + 1] = true;
                    return copy;
                }
                return prev;
            });
            await new Promise((res)=>setTimeout(res, TROPHY_PAUSE_MS));
        }
        setCurrentRep(0);
        setIsRunning(false);
    }, [
        active,
        isRunning,
        playWord
    ]);
    const stopGame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        autoCancel.current = true;
        currentAudio.current?.pause(); // silences the word being spoken right away
        setIsRunning(false);
    }, []);
    const toggleGame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (isRunning) stopGame();
        else startGame();
    }, [
        isRunning,
        startGame,
        stopGame
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "lesson-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "lesson-back-row",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    className: "lesson-back-btn",
                    onClick: stopGame,
                    children: "← Pagina principală"
                }, void 0, false, {
                    fileName: "[project]/src/app/learn/page.tsx",
                    lineNumber: 250,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 249,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "lesson-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "lesson-title",
                        children: "EiC · English in Colors"
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 254,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "lesson-subhead",
                        children: "Repetă în glas fiecare cuvânt pe care îl auzi"
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 255,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `shadow-repeat-btn ${isRunning ? 'is-stop' : ''}`,
                        onClick: toggleGame,
                        children: isRunning ? '■ Oprește' : trophies[active] ? '🔁 Exersează din nou' : '▶ Start'
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 256,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 253,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "lesson-grid",
                children: LESSONS.map((l, i)=>{
                    const isUnlocked = unlocked[i];
                    const isActive = active === i;
                    const stars = trophies[i] ? REPS_PER_LESSON : isActive ? starsThisRun[i] : 0;
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
                                        lineNumber: 274,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "lesson-letter",
                                        children: l.letter
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 275,
                                        columnNumber: 17
                                    }, this),
                                    trophies[i] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "lesson-trophy",
                                        "aria-label": "trofeu câștigat",
                                        children: "🏆"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 276,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 273,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "lesson-stars",
                                "aria-label": `${stars} din ${REPS_PER_LESSON} stele`,
                                children: Array.from({
                                    length: REPS_PER_LESSON
                                }).map((_, s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `lesson-star ${s < stars ? 'is-filled' : ''}`,
                                        children: "★"
                                    }, s, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 281,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 279,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "lesson-words",
                                children: l.words.map((w)=>{
                                    const isPlaying = isActive && playingWord === w.text;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `lesson-word ${isPlaying ? 'is-playing' : ''}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MarkedWord, {
                                            text: w.text,
                                            mark: w.mark
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/learn/page.tsx",
                                            lineNumber: 293,
                                            columnNumber: 23
                                        }, this)
                                    }, w.text, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 289,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 285,
                                columnNumber: 15
                            }, this)
                        ]
                    }, l.id, true, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 268,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 261,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/learn/page.tsx",
        lineNumber: 248,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_app_learn_page_tsx_140dsj9._.js.map