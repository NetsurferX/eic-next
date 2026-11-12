'use client'

import { useState } from 'react'
import { Fox, Shadow, Stage, Shell, POSE, usePreload, useReducedMotion, btn } from '../_anim'

const SIZE=230
export default function Page(){
  usePreload()
  const reduced=useReducedMotion()
  const [heard,setHeard]=useState(false)
  return <Shell title="👂 Ascultă cu atenție" desc="Reacție calmă: vulpea își îndreaptă atenția spre copil, clipește și răspunde printr-un gest mic.">
    <Stage height={380}>
      <div style={{position:'absolute',top:35,left:'12%',fontSize:30,opacity:.7}}>♪</div>
      <div style={{position:'absolute',top:65,right:'16%',fontSize:24,opacity:.6}}>♫</div>
      <Shadow x={300} size={SIZE}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',transformOrigin:'50% 85%',animation:reduced?'none':'listen 3s ease-in-out infinite'}}>
        <Fox f={{src:heard?POSE.front:POSE.idle,x:300,y:0,flip:1,sx:1,sy:1,rot:heard?-3:0}} size={SIZE}/>
      </div>
      {heard&&<div style={{position:'absolute',left:'58%',top:45,background:'#fff',padding:'9px 13px',borderRadius:14,boxShadow:'0 3px 12px #0002',fontWeight:700}}>Te ascult! 💛</div>}
      <style>{`@keyframes listen{0%,100%{transform:translateX(-50%) rotate(0)}35%{transform:translateX(-50%) rotate(-2deg)}65%{transform:translateX(-50%) rotate(1deg)}}`}</style>
    </Stage>
    <button style={{...btn(heard),marginTop:12}} onClick={()=>setHeard(v=>!v)}>{heard?'Ascultă din nou':'Spune ceva vulpii'}</button>
  </Shell>
}
