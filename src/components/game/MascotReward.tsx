'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Mascot, { MascotAction } from './Mascot'

export type RewardAnimationState = {
action: MascotAction

x: number
y: number

starX: number
starY: number

columnCupX: number
columnCupY: number

bigCupX: number
bigCupY: number

starColor?: string
}

type StartRewardOptions = {
starElement: HTMLElement
columnCupElement: HTMLElement
bigCupElement: HTMLElement

columnIsComplete: boolean

starColor?: string
}

type MascotRewardProps = {
animation: RewardAnimationState | null
size?: number
}

export function useMascotReward() {
const [animation, setAnimation] =
useState<RewardAnimationState | null>(null)

const timersRef = useRef<number[]>([])

const clearTimers = useCallback(() => {
timersRef.current.forEach((timer) => {
window.clearTimeout(timer)
})

timersRef.current = []
}, [])

useEffect(() => {
return () => {
clearTimers()
}
}, [clearTimers])

const schedule = useCallback(
(callback: () => void, delay: number) => {
const timer = window.setTimeout(callback, delay)

timersRef.current.push(timer)

return timer
},
[],
)

const startReward = useCallback(
({
starElement,
columnCupElement,
bigCupElement,
columnIsComplete,
starColor,
}: StartRewardOptions) => {
clearTimers()

const starRect =
starElement.getBoundingClientRect()

const columnCupRect =
columnCupElement.getBoundingClientRect()

const bigCupRect =
bigCupElement.getBoundingClientRect()

const starX =
starRect.left + starRect.width / 2

const starY =
starRect.top + starRect.height / 2

const columnCupX =
columnCupRect.left +
columnCupRect.width / 2

const columnCupY =
columnCupRect.top +
columnCupRect.height / 2

const bigCupX =
bigCupRect.left +
bigCupRect.width / 2

const bigCupY =
bigCupRect.top +
bigCupRect.height / 2

const baseState = {
starX,
starY,

columnCupX,
columnCupY,

bigCupX,
bigCupY,

starColor,
}

/*
* 1.
* Vulpea pleacă spre stea.
*/
setAnimation({
...baseState,

action: 'walking',

x: starX,
y: starY,
})

/*
* 2.
* Vulpea întinde laba și apucă steaua.
*/
schedule(() => {
setAnimation({
...baseState,

action: 'grabbing',

x: starX,
y: starY,
})
}, 650)

/*
* 3.
* Vulpea ține steaua și merge la cupă.
*/
schedule(() => {
setAnimation({
...baseState,

action: 'holding-star',

x: columnCupX,
y: columnCupY,
})
}, 1050)

/*
* 4.
* Steaua este pusă în cupa coloanei.
*/
schedule(() => {
setAnimation({
...baseState,

action: 'holding-star',

x: columnCupX,
y: columnCupY,
})
}, 1750)

/*
* Dacă nu este ultima stea,
* animația se termină aici.
*/
if (!columnIsComplete) {
schedule(() => {
setAnimation({
...baseState,

action: 'celebrating',

x: columnCupX,
y: columnCupY,
})
}, 2050)

schedule(() => {
setAnimation(null)
}, 2850)

return
}

/*
* ======================================================
* COLOANA ESTE COMPLETĂ
* ======================================================
*/

/*
* 5.
* Vulpea apucă cupa coloanei.
*/
schedule(() => {
setAnimation({
...baseState,

action: 'holding-cup',

x: columnCupX,
y: columnCupY,
})
}, 2300)

/*
* 6.
* Vulpea duce cupa la cupa mare.
*/
schedule(() => {
setAnimation({
...baseState,

action: 'holding-cup',

x: bigCupX,
y: bigCupY,
})
}, 3200)

/*
* 7.
* Vulpea înclină cupa și varsă stelele.
*/
schedule(() => {
setAnimation({
...baseState,

action: 'pouring',

x: bigCupX,
y: bigCupY,
})
}, 4000)

/*
* 8.
* Bucurie.
*/
schedule(() => {
setAnimation({
...baseState,

action: 'celebrating',

x: bigCupX,
y: bigCupY,
})
}, 5100)

/*
* 9.
* Eliminăm overlay-ul.
*/
schedule(() => {
setAnimation(null)
}, 6000)
},
[clearTimers, schedule],
)

// Oprește imediat orice animație de recompensă în curs (elimină și
// temporizatoarele programate, ȘI ascunde vulpea pe loc) — folosit când
// utilizatorul navighează manual în altă parte (schimbă nivelul, resetează
// jocul) în timp ce vulpea era încă la jumătatea drumului spre cupa mare.
const stopReward = useCallback(() => {
clearTimers()
setAnimation(null)
}, [clearTimers])

return {
animation,
startReward,
stopReward,
}
}

export default function MascotReward({
animation,
size = 96,
}: MascotRewardProps) {
if (!animation) {
return null
}

return (
<div
className="mascot-reward-layer"
style={{
left: animation.x,
top: animation.y,
}}
aria-hidden="true"
>
<Mascot
action={animation.action}
size={size}
/>

{animation.action === 'holding-star' && (
<span
className="mascot-reward-held-star"
style={{
color:
animation.starColor ??
'#ffc107',
}}
>
★
</span>
)}

{animation.action === 'holding-cup' && (
<span className="mascot-reward-held-cup">
🏆
</span>
)}

{animation.action === 'pouring' && (
<div className="mascot-reward-pouring-stars">
<span>★</span>
<span>★</span>
<span>★</span>
<span>★</span>
<span>★</span>
</div>
)}
</div>
)
}