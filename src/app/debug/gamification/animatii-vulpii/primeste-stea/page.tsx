'use client'

import { useState } from 'react'
import { Fox, Shadow, Stage, Shell, POSE, usePreload, useReducedMotion, btn } from '../_anim'

const SIZE=220
export default function Page(){
  usePreload()
  const reduced=useReducedMotion()
  const [received,setReceived]=useState(false)
  return <Shell title="⭐ Primește o stea" desc="Steaua coboară spre lăbuțe, vulpea o primește cu grijă și apoi o arată cu mândrie.">
    <Stage height={380}>
      <Shadow x={300} size={SIZE}/>
      <Fox f={{src:received?POSE.clap:POSE.front,x:300,y:0,flip:1,sx:1,sy:1,rot:0}} size={SIZE}/>
      {received&&<div style={{position:'absolute',left:'50%',top:68,fontSize:42,transform:'translateX(-50%)',animation:reduced?'none':'star-catch 1.1s cubic-bezier(.2,.8,.2,1) both'}}>⭐</div>}
      {!received&&<div style={{position:'absolute',left:'50%',top:42,fontSize:38,transform:'translateX(-50%)'}}>⭐</div>}
      {received&&<div style={{position:'absolute',right:24,top:24,background:'#fff8d9',padding:'8px 12px',borderRadius:14,fontWeight:800}}>Bravo! ✨</div>}
      <style>{`@keyframes star-catch{0%{transform:translate(-50%,-20px) scale(1.3);opacity:0}65%{transform:translate(-50%,190px) scale(.8);opacity:1}100%{transform:translate(-50%,165px) scale(1);opacity:1}}`}</style>
    </Stage>
    <button style={{...btn(received),marginTop:12}} onClick={()=>setReceived(v=>!v)}>{received?'Resetează':'Oferă steaua'}</button>
  </Shell>
}
