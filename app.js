import {Timer, formatTime, MAX_TIME} from './timer.js';
const $ = id => document.getElementById(id);
const timer = new Timer();
let target=8880, kind='challenge', sound=false, audio=null, frame=null;
let holdOpened=false, ignoreBackdropUntil=0;
function releaseHold(){if(holdOpened){ignoreBackdropUntil=performance.now()+500;holdOpened=false;}}
document.addEventListener('pointerup',releaseHold,true);
document.addEventListener('pointercancel',releaseHold,true);
document.addEventListener('keyup',e=>{if([' ','Enter'].includes(e.key))releaseHold();},true);
const svgNS='http://www.w3.org/2000/svg';
for(let n=0;n<60;n++){
 const angle=n*Math.PI/30, major=n%5===0, outer=145, inner=major?135:140;
 const line=document.createElementNS(svgNS,'line');
 for(const [name,radius,fn] of [['x1',inner,Math.sin],['y1',inner,Math.cos],['x2',outer,Math.sin],['y2',outer,Math.cos]])line.setAttribute(name,160+(name[0]==='y'?-1:1)*radius*fn(angle));
 if(major){line.setAttribute('stroke','#8f9db4');line.setAttribute('stroke-width',1.3);}
 if(n===0){line.setAttribute('stroke','#4169ef');line.setAttribute('stroke-width',3);}
 $('ticks').append(line);
}
function prepareAudio(){if(sound){try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}catch{}}}
function chime(){if(!sound||!audio)return;try{for(let i=0;i<3;i++){const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=i===1?880:660;const at=audio.currentTime+i*.22;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.12,at+.01);g.gain.exponentialRampToValueAtTime(.001,at+.2);o.start(at);o.stop(at+.21);}}catch{}}
function render(){
 const value=timer.value();
 if(timer.running&&((timer.mode==='countdown'&&value<=0)||(timer.mode==='stopwatch'&&value>=MAX_TIME))){timer.finish();chime();}
 const text=formatTime(timer.value());$('time').textContent=text;$('time').classList.toggle('has-minutes',text.includes(':'));
 $('unit').textContent=text.includes(':')?'分 · 秒':'秒';
 document.body.classList.toggle('running',timer.running);
 $('toggle-label').textContent=timer.running?'暂停':timer.finished?'再来一次':timer.begun?'继续':'开始';
 $('toggle-icon').textContent=timer.running?'Ⅱ':timer.finished?'↻':'▶';
 const progress=timer.mode==='countdown'?timer.value()/timer.display:(timer.value()%60000)/60000;
 $('progress').style.strokeDashoffset=961.327*(1-progress);
 $('marker').setAttribute('transform',`rotate(${progress*360} 160 160)`);
 $('status').textContent=timer.finished?'时间到':!timer.running&&timer.begun&&timer.mode==='stopwatch'&&target!==null?Math.abs(timer.value()-target)<5?'正好命中！':`${timer.value()>target?'超出':'还差'} ${formatTime(Math.abs(timer.value()-target))}`:'';
 for(const button of document.querySelectorAll('[data-mode]')){button.disabled=timer.running;button.setAttribute('aria-pressed',String(button.dataset.mode===timer.mode));}
 document.querySelector('.mode-tabs').classList.toggle('countdown',timer.mode==='countdown');
 $('time-setting').disabled=timer.running;
 $('time-setting').firstChild.textContent=timer.mode==='countdown'?'时长 ':'目标 ';
 $('setting-value').textContent=timer.mode==='countdown'?`${Number((timer.display/1000).toFixed(2))} 秒`:target===null?'未设置':`${Number((target/1000).toFixed(2))} 秒`;
 if(timer.running&&frame===null)frame=requestAnimationFrame(()=>{frame=null;render();});
}
function reset(){timer.reset();render();}
$('toggle').addEventListener('click',()=>{prepareAudio();if(timer.running){timer.pause();$('time').classList.remove('result-pop');void $('time').offsetWidth;$('time').classList.add('result-pop');}else{if(timer.finished)timer.reset();timer.start();}render();});
$('reset').addEventListener('click',reset);
for(const button of document.querySelectorAll('[data-mode]'))button.addEventListener('click',()=>{timer.setMode(button.dataset.mode);render();});
$('sound').addEventListener('click',()=>{sound=!sound;$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'关闭提示音':'开启提示音');$('sound').classList.toggle('sound-on',sound);prepareAudio();});
for(const dialog of document.querySelectorAll('dialog')){
 dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){if(holdOpened||performance.now()<ignoreBackdropUntil)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
}
function selectKind(next){kind=next;for(const b of document.querySelectorAll('[data-kind]'))b.setAttribute('aria-pressed',String(b.dataset.kind===kind));
 const speed=kind==='speed';$('display-field').hidden=!speed;$('fake-display').disabled=!speed;
 $('secret-value-label').textContent=speed?'实际时长':kind==='fixed'?'暂停结果':'目标时间';
 $('prank-description').textContent=speed?'显示与实际时长不同，数字会匀速变快或变慢。':kind==='fixed'?'指定那一轮，暂停后显示你预设的时间。':'指定那一轮，无论何时暂停，都命中目标。';
}
for(const b of document.querySelectorAll('[data-kind]'))b.addEventListener('click',()=>{const changed=kind!==b.dataset.kind;selectKind(b.dataset.kind);if(changed)$('secret-value').value=kind==='speed'?300:kind==='fixed'?3:(target??8880)/1000;});
function schedule(){const show=$('schedule').value==='round';$('round-field').hidden=!show;$('round').disabled=!show;}
$('schedule').addEventListener('change',schedule);
function openDirector(){
 const r=timer.rule;
 selectKind(r?.kind??(timer.mode==='countdown'?'speed':'challenge'));
 $('secret-value').value=(r?.value??(kind==='speed'?300000:target??8880))/1000;
 $('fake-display').value=(r?.display??timer.display)/1000;
 $('schedule').value=r?.repeat?'every':r&&r.round!==1?'round':'next';$('round').value=r?.round??3;schedule();
 $('director-state').textContent=r?`已完成 ${timer.rounds} 轮 · ${r.repeat?'每一轮生效':`第 ${r.round} 轮生效`}`:'当前未开启整蛊';$('director-error').textContent='';$('director').showModal();
}
let hold=null, origin=null;
function cancelHold(){clearTimeout(hold);hold=null;origin=null;}
function startHold(){if(hold!==null)return;hold=setTimeout(()=>{hold=null;holdOpened=true;openDirector();},3000);}
$('title').addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();origin={x:e.clientX,y:e.clientY};$('title').setPointerCapture(e.pointerId);startHold();});
$('title').addEventListener('pointermove',e=>{if(origin&&Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>24)cancelHold();});
for(const name of ['pointerup','pointercancel','lostpointercapture'])$('title').addEventListener(name,cancelHold);
$('title').addEventListener('contextmenu',e=>e.preventDefault());
$('title').addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();if(!e.repeat)startHold();}});
$('title').addEventListener('keyup',()=>{holdOpened=false;cancelHold();});$('title').addEventListener('blur',cancelHold);
window.addEventListener('blur',cancelHold);
$('director-form').addEventListener('submit',e=>{e.preventDefault();try{const rule={kind,value:Math.round(Number($('secret-value').value)*1000),display:Math.round(Number($('fake-display').value)*1000),round:$('schedule').value==='round'?Number($('round').value):1,repeat:$('schedule').value==='every'};timer.configure(rule);if(kind==='challenge')target=rule.value;$('director').close();render();}catch(error){$('director-error').textContent=error.message;}});
$('disable-prank').addEventListener('click',()=>{timer.clearRule();timer.rounds=0;reset();$('director').close();});
$('time-setting').addEventListener('click',()=>{const countdown=timer.mode==='countdown';$('public-heading').textContent=countdown?'倒计时时长':'挑战目标';$('public-label').textContent=countdown?'倒计时时长':'目标时间';$('public-value').value=(countdown?timer.display:target??8880)/1000;$('remove-target').hidden=countdown;$('public-error').textContent='';$('public-settings').showModal();});
$('public-form').addEventListener('submit',e=>{e.preventDefault();const value=Math.round(Number($('public-value').value)*1000);if(!Number.isFinite(value)||value<=0||value>MAX_TIME){$('public-error').textContent='时间须大于 0，且不超过 99 分 59.99 秒';return;}if(timer.mode==='countdown')timer.setMode('countdown',value);else{target=value;timer.reset();}$('public-settings').close();render();});
$('remove-target').addEventListener('click',()=>{target=null;timer.reset();$('public-settings').close();render();});
document.addEventListener('visibilitychange',()=>{cancelHold();if(!document.hidden)render();});
render();
