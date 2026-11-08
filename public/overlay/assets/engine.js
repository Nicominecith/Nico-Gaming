/* Stage-Skalierung: passt 1920x1080 (quer) bzw. 1080x1920 (hoch) in jede Bildschirmgröße */
(function(){const st=document.getElementById('stage');
 function fit(){const q=new URLSearchParams(location.search);const m=q.get('mode');
  const vw=innerWidth,vh=innerHeight;
  const portrait=m?m==='portrait':vh>vw;document.body.classList.toggle('portrait',portrait);
  const W0=portrait?1080:1920,H0=portrait?1920:1080,s=Math.min(vw/W0,vh/H0);
  // Bühne füllt den ganzen Bildschirm (jedes Format/jede Auflösung, z. B. 1280x720), Elemente hängen an den Rändern
  const Wf=Math.round(vw/s),Hf=Math.round(vh/s);
  // Sicherheitsrand (Standard 5 %): manche Apps zeigen den Rand der Overlay-Fläche abgeschnitten. Ändern mit ?safe=0..15
  const sp=parseFloat(q.get('safe')),pct=isNaN(sp)?5:Math.max(0,Math.min(15,sp));
  const sx=Math.round(Wf*pct/100),sy=Math.round(Hf*pct/100),W=Wf-2*sx,H=Hf-2*sy;
  st.style.width=W+'px';st.style.height=H+'px';st.style.transform='translate('+(sx*s)+'px,'+(sy*s)+'px) scale('+s+')';window.NICO_DIM={W,H};
  const cv=document.getElementById('fx');if(cv&&(cv.width!==W||cv.height!==H)){cv.width=W;cv.height=H}}
 fit();addEventListener('resize',fit);
// Teile ausblenden: ?hide=chat,music,sponsor,viewers,alerts
 const h=(new URLSearchParams(location.search).get('hide')||'').split(',');
 h.forEach(k=>document.querySelectorAll('[data-box="'+k+'"]').forEach(e=>e.classList.add('hide')));
})();
/* Gemeinsame Engine: Partikel, Widgets, Sound, Titel, Countdown, Ticker */
(function(){
const C=window.NICO, q=new URLSearchParams(location.search), $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
// Widgets einsetzen: <iframe data-widget="chat">
$$('iframe[data-widget]').forEach(f=>{const u=C.widgets[f.dataset.widget];if(u)f.src=u;else{const b=f.closest('[data-box]');if(b)b.classList.add('hide');else f.remove()}});
// Partikel (aufsteigende Glut)
const cv=$('#fx'); if(cv){const x=cv.getContext('2d');const D=window.NICO_DIM||{W:1920,H:1080};cv.width=D.W;cv.height=D.H;
 const P=Array.from({length:70},()=>({x:Math.random()*(window.NICO_DIM||{W:1920}).W,y:Math.random()*(window.NICO_DIM||{H:1080}).H,r:Math.random()*2.6+.6,v:Math.random()*.7+.2,s:Math.random()*Math.PI*2,a:Math.random()*.6+.2}));
 (function f(){x.clearRect(0,0,cv.width,cv.height);for(const p of P){p.y-=p.v;p.s+=.012;p.x+=Math.sin(p.s)*.5;if(p.y<-10){p.y=cv.height+10;p.x=Math.random()*(window.NICO_DIM||{W:1920}).W}
  x.beginPath();x.fillStyle=`rgba(255,${60+p.r*30|0},80,${p.a*(p.y/cv.height+.15)})`;x.shadowColor='#ff1744';x.shadowBlur=14;x.arc(p.x,p.y,p.r,0,7);x.fill()}requestAnimationFrame(f)})()}
// Titel in Buchstaben zerlegen
$$('.title').forEach(t=>{const s=t.textContent;t.dataset.t=s;t.innerHTML=[...s].map((c,i)=>`<span style="animation-delay:${.5+i*.06}s">${c===' '?'&nbsp;':c}</span>`).join('')});
// Sound
const S=window.Sound={ctx:null,
 el(src,loop){const a=new Audio('assets/audio/'+src);a.loop=!!loop;return a},
 play(src,v=1,delay=0){setTimeout(()=>{const a=S.el(src);a.volume=Math.min(1,v*C.sfxVolume);a.play().catch(()=>{})},delay*1000)},
 loop(src,vol,fadeIn=3){const a=S.el(src,true);a.volume=0;const go=()=>a.play().then(()=>{S.fade(a,vol,fadeIn)}).catch(()=>{});go();
  addEventListener('click',go,{once:true});return a},
 fade(a,to,sec){const from=a.volume,t0=performance.now();(function s(n){const k=Math.min(1,(n-t0)/(sec*1000));a.volume=Math.max(0,Math.min(1,from+(to-from)*k));if(k<1)requestAnimationFrame(s)})(t0)}};
// Countdown mm:ss
window.countdown=(el,bar,min,done)=>{const tot=min*60;let t=tot;const draw=()=>{const m=String(t/60|0).padStart(2,'0'),s=String(t%60).padStart(2,'0');el.textContent=m+':'+s;if(bar)bar.style.width=(100*(1-t/tot))+'%'};draw();
 const iv=setInterval(()=>{t--;if(t<=3&&t>0)Sound.play('tick.ogg',.9);if(t<=0){clearInterval(iv);t=0;draw();el.classList.add('done');done&&done()}else draw()},1000)};
window.countup=el=>{let t=0;setInterval(()=>{t++;el.textContent=String(t/60|0).padStart(2,'0')+':'+String(t%60).padStart(2,'0')},1000)};
// Ticker
const tk=$('.ticker');if(tk){C.ticker.forEach(t=>{const d=document.createElement('div');d.className='orb';d.textContent=t;tk.appendChild(d)});let i=0;const n=tk.children;
 const step=()=>{const p=n[(i-1+n.length)%n.length];p.classList.remove('on');p.classList.add('off');setTimeout(()=>p.classList.remove('off'),700);n[i%n.length].classList.add('on');i++};step();setInterval(step,3600)}
window.NICO_Q=q;
})();
