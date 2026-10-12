// Deform the supplied photographic texture in the browser; keep the source asset unchanged.
function createCheeseCurtain(canvas, hero, isPaused) {
  const stage = hero.closest('.hero-scroll');
  const cue = hero.querySelector('.cheese-cue');
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false });
  if (!gl) { canvas.hidden = true; if(cue)cue.hidden=true; if(stage)stage.style.height='auto'; return null; }
  const vertex = `attribute vec2 position; varying vec2 uv;
    void main(){uv=vec2((position.x+1.0)*.5,1.0-(position.y+1.0)*.5);gl_Position=vec4(position,0.0,1.0);}`;
  const fragment = `precision mediump float;
    varying vec2 uv;uniform sampler2D photo;uniform sampler2D surface;uniform vec2 size;
    uniform float progress;uniform float phase;uniform float spread;
    void main(){
      float sheetH=size.x*spread*.4;
      float active=1.0;
      float base=-.42*sheetH+sin(phase*.38)*sheetH*.035+progress*sheetH*.08;
      float wave=(sin(uv.x*17.0+phase*.7)+.42*sin(uv.x*31.0-phase*.48))*sheetH*.026*active;
      float v=(uv.y*size.y-base+wave)/sheetH;
      float stretch=1.0+.07*active*sin(uv.x*21.0+phase*.35);
      v/=stretch;
      if(v>1.0){gl_FragColor=vec4(0.0);return;}
      // Continue the opaque upper surface upward with a continuous texture mapping.
      // The photograph's straight top edge is never visible in the hero.
      float sampledY=max(v,0.0);
      float u=(uv.x+(spread-1.0)*.5)/spread;
      u+=sin(v*12.0+uv.x*9.0+phase*.6)*.0035*active*smoothstep(.12,.8,max(v,0.0));
      vec4 color=texture2D(photo,vec2(clamp(u,0.001,.999),clamp(sampledY,.001,.999)));
      float surfaceY=(uv.y*size.y-base+size.y)/(size.y+sheetH*.35);
      vec4 top=texture2D(surface,vec2(clamp(u,0.001,.999),clamp(surfaceY,.001,.999)));
      color=mix(top,color,smoothstep(.02,.19,v));
      // Above the drip edge, the sheet must be opaque rather than faintly see-through.
      if(v<.18)color.a=1.0;
      gl_FragColor=color;
    }`;
  function shader(type, text){const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
  let program;
  try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Cheese shader linking failed');}
  catch(error){canvas.hidden=true;if(cue)cue.hidden=true;if(stage)stage.style.height='auto';return null;}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniforms=Object.fromEntries(['size','progress','phase','spread','photo','surface'].map(name=>[name,gl.getUniformLocation(program,name)]));
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(uniforms.photo,0);
  let ready=false,current=0,target=0,raf=0,lastScroll=0,width=1,height=1;
  const range=780;
  function resize(){width=hero.clientWidth;height=hero.offsetHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);if(stage)stage.style.height='auto';requestDraw();}
  function draw(now){raf=0;if(!ready||isPaused()||document.hidden)return;current+= (target-current)*.12;if(Math.abs(target-current)<.0002)current=target;gl.useProgram(program);gl.uniform2f(uniforms.size,width,height);gl.uniform1f(uniforms.progress,current);gl.uniform1f(uniforms.phase,now*.001);gl.uniform1f(uniforms.spread,width<=850?1.6:1);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);canvas.dataset.progress=current.toFixed(3);if(cue)cue.style.opacity=String(Math.max(0,1-current*7));const bounds=hero.getBoundingClientRect();if(bounds.bottom>0&&bounds.top<innerHeight)requestDraw();}
  function requestDraw(){if(!raf&&ready&&!isPaused())raf=requestAnimationFrame(draw);}
  let loaded=0;
  function loadTexture(url,unit,targetTexture){const picture=new Image();picture.decoding='async';picture.onload=()=>{let source=picture;const maximum=gl.getParameter(gl.MAX_TEXTURE_SIZE);if(picture.width>maximum){source=document.createElement('canvas');source.width=maximum;source.height=Math.round(picture.height*maximum/picture.width);source.getContext('2d').drawImage(picture,0,0,source.width,source.height);}gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,targetTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);if(++loaded===2){ready=true;canvas.classList.add('ready');resize();}};picture.onerror=()=>{canvas.hidden=true;if(cue)cue.hidden=true;if(stage)stage.style.height='auto';};picture.src=url;}
  const surfaceTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,surfaceTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(uniforms.surface,1);
  loadTexture('/assets/raclette-cheese-overlay.webp',0,texture);loadTexture('/assets/raclette-cheese-surface.webp',1,surfaceTexture);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;canvas.hidden=true;if(cue)cue.hidden=true;if(stage)stage.style.height='auto';});
  document.addEventListener('visibilitychange',requestDraw);
  new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))requestDraw();}).observe(hero);
  resize();
  return {progress(value){const next=Math.min(1,Math.max(0,value));if(next!==target){target=next;lastScroll=performance.now();requestDraw();}},resize,pause(){if(raf)cancelAnimationFrame(raf);raf=0;resize();}};
}

(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;const body=document.body;
if(!paused)body.classList.add('js-motion');
// Build masks around text nodes while preserving links and color spans.
$$('[data-motion=words],[data-motion=hero]').forEach(el=>{let count=0;function split(node){[...node.childNodes].forEach(n=>{if(n.nodeType===3){const f=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(word=>{if(!word.trim()){f.append(document.createTextNode(word));return}const mask=document.createElement('span');mask.className='word-mask';const inner=document.createElement('span');inner.textContent=word;inner.style.setProperty('--word-delay',`${count++*85}ms`);mask.append(inner);f.append(mask)});n.replaceWith(f)}else if(n.nodeType===1&&n.tagName!=='BR')split(n)})}split(el)});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');observer.unobserve(e.target)}}),{threshold:.12});$$('.reveal,[data-motion=words]').forEach(el=>observer.observe(el));
let scheduled=false;const cheese=$('.cheese-flow'),hero=$('.hero'),heroImage=$('.hero-image'),handLayer=$('.hero-hand-layer');const curtain=hero&&cheese?createCheeseCurtain(cheese,handLayer?handLayer.parentElement:hero,()=>paused):null;
let reachStarted=null,handRaf=0,handDecoded=false,lastHandTime=0,handRetreat=0;
const pointer={x:0,y:0,tx:0,ty:0};
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
function requestHand(){if(handLayer&&!handRaf&&!paused&&!document.hidden)handRaf=requestAnimationFrame(drawHand)}
function drawHand(now){handRaf=0;if(paused||document.hidden)return;const visual=handLayer.parentElement.getBoundingClientRect();const visible=visual.top<innerHeight*(innerWidth<=850?.65:.85)&&visual.bottom>100;if(!visible){lastHandTime=0;return}const warm=handDecoded&&(!curtain||cheese.hidden||cheese.classList.contains('ready'));if(warm&&reachStarted===null)reachStarted=now+160;const t=reachStarted===null?0:clamp((now-reachStarted)/2100,0,1);const reach=t*t*t*(t*(t*6-15)+10);const dt=Math.min(40,lastHandTime?now-lastHandTime:16);lastHandTime=now;const blend=1-Math.exp(-dt/85);pointer.x+=(pointer.tx-pointer.x)*blend;pointer.y+=(pointer.ty-pointer.y)*blend;
// On phones, pull the hand back into the scene as the visual passes the upper viewport.
const retreatProgress=innerWidth<=850?clamp((innerHeight*.22-visual.top)/(visual.height*.55),0,1):0;
const retreatTarget=retreatProgress*retreatProgress*(3-2*retreatProgress);
handRetreat+=(retreatTarget-handRetreat)*(1-Math.exp(-dt/110));
if(Math.abs(retreatTarget-handRetreat)<.001)handRetreat=retreatTarget;
handLayer.dataset.retreat=handRetreat.toFixed(3);
handLayer.style.opacity=String((.18+Math.min(1,t*3)*.82)*(1-handRetreat*.22));
handLayer.style.setProperty('--reach-scale',String(.68+reach*.29-handRetreat*.22));
handLayer.style.setProperty('--reach-z',(-150+reach*250-handRetreat*340)+'px');
handLayer.style.setProperty('--reach-lift',(24*(1-reach)+handRetreat*24)+'px');
handLayer.style.setProperty('--reach-x',(-18*(1-reach))+'px');
handLayer.style.setProperty('--reach-turn',(-3*(1-reach))+'deg');
handLayer.style.setProperty('--hand-x',(pointer.x*48)+'px');
handLayer.style.setProperty('--hand-y',(pointer.y*30)+'px');
handLayer.style.setProperty('--hand-rx',(8*(1-reach)+handRetreat*6-pointer.y*5)+'deg');
handLayer.style.setProperty('--hand-ry',(-14*(1-reach)-handRetreat*7+pointer.x*9)+'deg');
if(!warm||t<1||Math.abs(retreatTarget-handRetreat)>.001||Math.abs(pointer.tx-pointer.x)+Math.abs(pointer.ty-pointer.y)>.001)requestHand();}
if(handLayer){const photograph=handLayer.querySelector('img');Promise.resolve(photograph.decode?photograph.decode():null).catch(()=>{}).then(()=>{handDecoded=true;requestHand()});new IntersectionObserver(()=>requestHand()).observe(handLayer.parentElement)}
function frame(){scheduled=false;if(paused)return;const y=window.scrollY;if(hero){const p=clamp(y/780,0,1);if(curtain)curtain.progress(p);requestHand()}$$('.parallax').forEach(el=>{const r=el.parentElement.getBoundingClientRect();el.style.transform=`translateY(${Math.max(-70,Math.min(30,-r.top*.09-35))}px)`});$$('[data-motion=highlight]').forEach(el=>{const r=el.getBoundingClientRect();const p=clamp((innerHeight*.85-r.top)/(innerHeight*.5),0,1);el.style.color=`rgb(${Math.round(130+p*112)},${Math.round(128+p*110)},${Math.round(122+p*107)})`})}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(frame)}},{passive:true});addEventListener('resize',()=>{if(curtain)curtain.resize();frame()});frame();
const motion=$('#motion-toggle');function setPause(value){paused=value;body.classList.toggle('motion-paused',paused);if(curtain)curtain.pause();if(handRaf){cancelAnimationFrame(handRaf);handRaf=0}motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'Animationen aktivieren':'Animationen pausieren';if(!paused)body.classList.add('js-motion');frame()}setPause(paused);motion.addEventListener('click',()=>setPause(!paused));reduced.addEventListener('change',e=>setPause(e.matches));
document.addEventListener('visibilitychange',()=>{lastHandTime=0;requestHand()});
if(hero&&handLayer){hero.addEventListener('pointermove',e=>{if(paused||e.pointerType!=='mouse')return;const r=hero.getBoundingClientRect();pointer.tx=clamp(((e.clientX-r.left)/r.width-.5)*2,-1,1);pointer.ty=clamp(((e.clientY-r.top)/r.height-.5)*2,-1,1);requestHand()},{passive:true});hero.addEventListener('pointerleave',()=>{pointer.tx=0;pointer.ty=0;requestHand()})}
const steamPhoto=$('#original .feature-photo');if(steamPhoto)new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('steam-visible',e.isIntersecting)),{threshold:.08}).observe(steamPhoto);
$$('.customer-reviews').forEach(section=>{new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('reviews-visible',e.isIntersecting)),{threshold:.05}).observe(section);const toggle=section.querySelector('.reviews-toggle');toggle.addEventListener('click',()=>{const stopped=section.classList.toggle('reviews-stopped');toggle.setAttribute('aria-pressed',String(stopped));toggle.innerHTML=stopped?'Bewertungen weiterlaufen lassen <span aria-hidden="true">▷</span>':'Bewertungen anhalten <span aria-hidden="true">Ⅱ</span>'});});
const menu=$('.menu-toggle'),nav=$('#navigation');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');nav.classList.toggle('open',open)});nav.addEventListener('click',e=>{if(e.target.closest('a')){menu.setAttribute('aria-expanded','false');nav.classList.remove('open')}});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus()}});
const rail=$('.photo-rail');if(rail){$('.rail-prev').addEventListener('click',()=>rail.scrollBy({left:-rail.clientWidth*.75,behavior:paused?'instant':'smooth'}));$('.rail-next').addEventListener('click',()=>rail.scrollBy({left:rail.clientWidth*.75,behavior:paused?'instant':'smooth'}));}
$$('.step-num').forEach(el=>{el.classList.add('flip-board');[...el.childNodes].filter(n=>n.nodeType===3).forEach(n=>{const fragment=document.createDocumentFragment();[...n.textContent].forEach(c=>{const span=document.createElement('span');span.textContent=c;fragment.append(span)});n.replaceWith(fragment)})});
$$('.card-body h3').forEach(el=>{el.classList.add('rotate-title')});
const dialog=$('#lightbox');$$('.gallery-item').forEach(b=>b.addEventListener('click',()=>{dialog.querySelector('img').src=b.dataset.photo;dialog.querySelector('img').alt=b.dataset.caption;dialog.querySelector('p').textContent=b.dataset.caption;dialog.showModal()}));dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
const form=$('#event-form');if(form){const preset=new URLSearchParams(location.search).get('konzept');if(preset){const input=[...form.querySelectorAll('[data-slug]')].find(i=>i.dataset.slug===preset);if(input)input.checked=true}const date=form.querySelector('input[type=date]');const now=new Date();date.min=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);let text='Guten Tag Mr. Cheese Team,\n\nwir möchten ein individuelles Catering-Angebot für folgendes Event anfragen:\n\n'+['Anlass','Datum','Ort','Gaeste','Unternehmen','Name','Email','Telefon'].map(k=>(k==='Gaeste'?'Gästezahl':k)+': '+(data.get(k)||'Noch offen')).join('\n')+'\nGewünschte Konzepte: '+(data.getAll('Konzept').join(', ')||'Bitte beraten Sie uns')+'\n\nWünsche: '+(data.get('Wuensche')||'Keine weiteren Angaben')+'\n\nVielen Dank und freundliche Grüße\n'+data.get('Name');const result=$('.form-result');result.hidden=false;result.querySelector('textarea').value=text;const subject='Catering-Anfrage: '+data.get('Anlass')+' in '+data.get('Ort');$('#open-request-email').href='mailto:mr.cheese.raclette@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(text);result.scrollIntoView({behavior:paused?'instant':'smooth',block:'center'});$('#copy-request').onclick=async()=>{try{await navigator.clipboard.writeText(text);$('#copy-status').textContent='Anfragetext kopiert.'}catch{result.querySelector('textarea').select();$('#copy-status').textContent='Bitte den markierten Anfragetext kopieren.'}}})}
if(form)form.querySelector('button[type=submit]').disabled=false;
})();
