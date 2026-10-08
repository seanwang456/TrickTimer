export const MAX_TIME = 5999990;
function duration(value) { if (!Number.isFinite(value) || value <= 0 || value > MAX_TIME) throw new RangeError('时间须大于 0，且不超过 99 分 59.99 秒'); }
export function formatTime(ms) {
 const ticks = Math.floor(Math.max(0, Math.min(MAX_TIME, ms)) / 10);
 const seconds = Math.floor(ticks / 100) % 60;
 const minutes = Math.floor(ticks / 6000);
 return `${minutes ? String(minutes).padStart(2,'0') + ':' : ''}${String(seconds).padStart(2,'0')}.${String(ticks % 100).padStart(2,'0')}`;
}
// Stretch the final fractional segment by half a second without looping backwards.
function prankElapsed(elapsed, target) {
 const delay = 500;
 const segmentStart = Math.floor((target - 1) / 1000) * 1000;
 const segmentLength = target - segmentStart;
 if (elapsed <= segmentStart) return elapsed;
 if (elapsed < target + delay) {
  return segmentStart + (elapsed - segmentStart) * segmentLength / (segmentLength + delay);
 }
 return elapsed - delay;
}
export class Timer {
 constructor(now = () => performance.now()) { this.now=now; this.mode='stopwatch'; this.display=180000; this.rule=null; this.rounds=0; this.reset(); }
 setMode(mode, display=this.display) { if(!['stopwatch','countdown'].includes(mode)) throw new RangeError('未知工具'); duration(display); this.mode=mode; this.display=display; this.reset(); }
 configure(rule) {
  if(!['challenge','fixed','speed'].includes(rule.kind)) throw new RangeError('未知玩法');
  duration(rule.value); if(rule.kind==='speed')duration(rule.display);
  if(!Number.isInteger(rule.round)||rule.round<1||rule.round>999)throw new RangeError('轮次须为 1–999 的整数');
  this.rule={...rule};this.rounds=0;this.setMode(rule.kind==='speed'?'countdown':'stopwatch',rule.kind==='speed'?rule.display:this.display);
 }
 clearRule(){this.rule=null;}
 reset(){this.running=false;this.elapsed=0;this.startedAt=0;this.counted=false;this.finished=false;this.forced=null;this.activeRule=null;this.actual=this.display;this.begun=false;}
 start(){
  if(this.running||this.finished)return;
  if(!this.begun){this.begun=true;const r=this.rule;const applicable=r && (r.kind==='speed' ? this.mode==='countdown' : this.mode==='stopwatch');this.activeRule=applicable&&(r.repeat||r.round===this.rounds+1)?{...r}:null;this.actual=this.activeRule?.kind==='speed'?this.activeRule.value:this.display;}
  this.forced=null;this.startedAt=this.now();this.running=true;
 }
 elapsedNow(){return this.elapsed+(this.running?this.now()-this.startedAt:0);}
 value(){
  if(this.forced!==null)return this.forced;
  const ms=this.elapsedNow();
  if(this.mode==='countdown')return Math.max(0,this.display-ms*this.display/this.actual);
  return Math.min(MAX_TIME,this.activeRule?prankElapsed(ms,this.activeRule.value):ms);
 }
 countRound(){if(this.counted)return;this.counted=true;const r=this.rule;const applicable=r && (r.kind==='speed'?this.mode==='countdown':this.mode==='stopwatch');if(!r||applicable)this.rounds++;if(this.activeRule&&!this.activeRule.repeat)this.rule=null;}
 pause(){if(!this.running)return this.value();this.elapsed=this.elapsedNow();this.running=false;if(this.activeRule&&this.mode==='stopwatch')this.forced=this.activeRule.value;this.countRound();return this.value();}
 finish(){if(this.finished)return;this.pause();this.finished=true;}
}
