'use client'

import { useState } from 'react'
import { Fox, Shadow, Stage, Shell, POSE, usePreload, useReducedMotion, btn } from '../_anim'

// Pescuit: vulpea rămâne așezată pe ponton. Undița și pluta au mișcări
// mici, independente; la trăsătură ridică discret vârful, fără alergare/sărituri.
const SIZE = 220
const CSS = `
@keyframes water-drift { 0%,100% { transform:translateX(0) } 50% { transform:translateX(18px) } }
@keyframes float-bob { 0%,100% { transform:translateY(0) rotate(-2deg) } 50% { transform:translateY(5px) rotate(3deg) } }
@keyframes rod-breathe { 0%,100% { transform:rotate(0deg) } 50% { transform:rotate(-1.2deg) } }
@keyframes rod-tug { 0%,100% { transform:rotate(0deg) } 35% { transform:rotate(-4deg) } 70% { transform:rotate(1deg) } }
@keyframes ripple { 0% { transform:scale(.5);opacity:.65 } 100% { transform:scale(1.8);opacity:0 } }
`

export default function Page() {
  usePreload()
  const reduced = useReducedMotion()
  const [bite, setBite] = useState(false)
  const foxX = 250
  return (
    <Shell title="🎣 Pescuitul liniștit" desc="Vulpea stă așezată pe ponton, ține undița și urmărește pluta. Apasă „Trage ușor” pentru o reacție discretă.">
      <style>{CSS}</style>
      <Stage height={390} sky="linear-gradient(#c9e9f7 0 48%,#9bd1e7 49%,#6fb4d1 100%)" ground="linear-gradient(#b9824d,#81512f)">
        <div style={{position:'absolute',left:0,right:0,bottom:56,height:142,background:'linear-gradient(#a8d9e8,#5da9c7)',overflow:'hidden'}}>
          {[0,1,2,3,4].map(i=><div key={i} style={{position:'absolute',left:i*190-20,top:35+i%2*28,width:150,height:2,background:'rgba(255,255,255,.35)',animation:reduced?'none':`water-drift ${5+i}s ease-in-out infinite`}} />)}
        </div>
        <div style={{position:'absolute',left:0,right:0,bottom:0,height:58,background:'repeating-linear-gradient(0deg,#98643b 0 8px,#b47a49 8px 11px)',borderTop:'5px solid #e0b47a'}} />
        <Shadow x={foxX} size={SIZE}/>
        <Fox f={{src:POSE.sit,x:foxX,y:0,flip:1,sx:1,sy:1,rot:0}} size={SIZE}/>
        <div style={{position:'absolute',left:foxX+38,bottom:142,width:150,height:150,transformOrigin:'8% 92%',animation:reduced?'none':bite?'rod-tug .65s ease-in-out 2':'rod-breathe 4s ease-in-out infinite',zIndex:4,pointerEvents:'none'}}>
          <svg viewBox="0 0 150 150" width="150" height="150" style={{overflow:'visible'}}>
            <path d="M8 136 Q45 82 120 8" fill="none" stroke="#70452d" strokeWidth="7" strokeLinecap="round"/>
            <path d="M8 136 Q45 82 120 8" fill="none" stroke="#d6a16a" strokeWidth="2" strokeLinecap="round"/>
            <path d="M120 8 Q127 40 131 82" fill="none" stroke="#fff" strokeWidth="1.5"/>
          </svg>
        </div>
        <div style={{position:'absolute',left:'76%',bottom:122,animation:reduced?'none':'float-bob 2.4s ease-in-out infinite',zIndex:5}}>
          <div style={{width:9,height:22,borderRadius:'50%',background:'#e94b59',border:'2px solid white',boxShadow:'0 2px 4px #456'}}/>
          <div style={{position:'absolute',left:-15,top:15,width:40,height:12,border:'2px solid rgba(255,255,255,.7)',borderRadius:'50%',animation:reduced?'none':'ripple 2s ease-out infinite'}}/>
        </div>
        {bite && <div style={{position:'absolute',right:28,top:22,background:'#fff',padding:'7px 11px',borderRadius:14,fontWeight:700,fontSize:13,zIndex:8}}>Trage ușor… 🐟</div>}
      </Stage>
      <div style={{display:'flex',gap:8,marginTop:12}}>
        <button style={btn(bite)} onClick={()=>setBite(v=>!v)}>{bite?'Oprește trăsătura':'Trage ușor'}</button>
        <button style={btn()} onClick={()=>setBite(false)}>Așteaptă pluta</button>
      </div>
    </Shell>
  )
}
