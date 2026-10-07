import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Timer, formatTime} from '../timer.js';
const setup = () => {let now = 0; const timer = new Timer(() => now); return {timer, advance: ms => {now += ms;}};};
test('stopwatch excludes paused time and counts only first pause', () => {
 const {timer:t, advance:a}=setup(); t.start(); a(1234); assert.equal(t.pause(),1234); assert.equal(t.rounds,1); a(8000); t.start(); a(1000); assert.equal(t.pause(),2234); assert.equal(t.rounds,1); t.reset(); assert.equal(t.value(),0);
});
test('third completed round hits exact target once; reset preserves pending rule', () => {
 const {timer:t,advance:a}=setup(); t.configure({kind:'challenge',value:8880,round:3,repeat:false});
 for(let n=1;n<=3;n++){t.start();a(123);assert.equal(t.pause(),n===3?8880:123);t.reset();}
 assert.equal(t.rule,null);t.start();a(456);assert.equal(t.pause(),456);
});
test('abandoned run does not consume a round',()=>{const {timer:t}=setup();t.configure({kind:'fixed',value:3000,round:1});t.start();t.reset();assert.equal(t.rounds,0);t.start();assert.equal(t.pause(),3000);});
test('repeat rule applies on every new round and does not count resumes twice',()=>{const {timer:t}=setup();t.configure({kind:'fixed',value:3000,round:1,repeat:true});t.start();assert.equal(t.pause(),3000);t.start();t.pause();assert.equal(t.rounds,1);t.reset();t.start();assert.equal(t.pause(),3000);assert.equal(t.rounds,2);});
test('countdown displays 3 minutes over 5 actual minutes, excludes pause',()=>{const {timer:t,advance:a}=setup();t.configure({kind:'speed',value:300000,display:180000,round:1});t.start();a(150000);assert.equal(t.value(),90000);t.pause();a(500000);assert.equal(t.value(),90000);t.start();a(150000);assert.equal(t.value(),0);t.finish();assert.equal(t.rounds,1);assert.equal(t.rule,null);t.reset();t.start();a(90000);assert.equal(t.value(),90000);});
test('countdown finishes once after a background gap',()=>{const {timer:t,advance:a}=setup();t.setMode('countdown',1000);t.start();a(60000);assert.equal(t.value(),0);t.finish();t.finish();assert.equal(t.rounds,1);assert.equal(t.running,false);});
test('new instance has no secret settings',()=>{const {timer:t}=setup();t.configure({kind:'fixed',value:3000,round:1});assert.equal(new Timer().rule,null);});
test('reject nonfinite, zero, overlong and fractional round settings',()=>{const {timer:t}=setup();for(const value of [NaN,Infinity,0,-1,600000])assert.throws(()=>t.configure({kind:'fixed',value,round:1}));for(const round of [0,1.5,1000,NaN])assert.throws(()=>t.configure({kind:'fixed',value:3000,round}));assert.throws(()=>t.configure({kind:'speed',value:1000,display:0,round:1}));});
test('format uses hundredths and supports minutes',()=>{assert.equal(formatTime(8880),'08.88');assert.equal(formatTime(65010),'01:05.01');assert.equal(formatTime(-1),'00.00');});
