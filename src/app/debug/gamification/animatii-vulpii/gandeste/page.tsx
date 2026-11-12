'use client'

import { useState } from 'react'
import { Fox, Shadow, Stage, Shell, POSE, usePreload, useReducedMotion, btn } from '../_anim'

const SIZE=225
export default function Page(){
  usePreload()
  const reduced=useReducedMotion()
  const [thinking,setThinking]=useState(true)
  return <Shell title="💭 Se gândește" desc="O pauză de reflecție: vulpea înclină ușor capul, privește în sus, iar ideile apar pe rând.">
    <Stage height={380}>
      <Shadow x={300} size={SIZE}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',transformOrigin:'50% 85%',animation:reduced?'none':thinking?'think-sway 3.8s ease-in-out infinite':'none'}}>
        <Fox f={{src:thinking?POSE.front:POSE.idle,x:300,y:0,flip:1,sx:1,sy:1,rot:thinking?-4:0}} size={SIZE}/>
      </div>
      {thinking&&<div style={{position:'absolute',left:'59%',top:54,display:'flex',alignItems:'end',gap:7}}>
        {[0,1,2].map(i=><span key={i} style={{width:9+i*3,height:9+i*3,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 5px #5678',animation:reduced?'none':`thought 1.2s ease-in-out ${i*.22}s infinite alternate`}}/>)}
      </div>}
      <style>{`@keyframes think-sway{0%,100%{transform:translateX(-50%) rotate(-3deg)}50%{transform:translateX(-50%) rotate(3deg)}}@keyframes thought{to{transform:translateY(-9px);opacity:.45}}`}</style>
    </Stage>
    <button style={{...btn(thinking),marginTop:12}} onClick={()=>setThinking(v=>!v)}>{thinking?'Gata cu gânditul':'Las-o să se gândească'}</button>
  </Shell>
}
