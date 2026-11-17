import test from 'node:test';
import assert from 'node:assert/strict';
import worker, {validatePayload} from '../worker/handler.mjs';
import {createTasks,emptyRecord,normalizeSettings} from '../src/engine.mjs';
const origin='https://baikovaalina.github.io';
const env={TELEGRAM_BOT_TOKEN:'test-placeholder-not-a-real-token',TELEGRAM_CHAT_ID:'123',ALLOWED_ORIGINS:origin,REPORT_RATE_LIMITER:{limit:async()=>({success:true})}};
function payload(){const settings=normalizeSettings({mode:'mixed',level:8,count:10}),seed=42,now=Date.now();return {engineVersion:1,student:{name:'Проверка',grade:8},comment:'Только автоматический тест',consent:true,session:{id:'work-unit-test-12345678',seed,settings,startedAt:now-10000,finishedAt:now,elapsedMs:10000,records:createTasks(seed,settings).map(t=>({...emptyRecord(),attempts:[{value:String(t.kind==='choice'?t.correctIndex:t.expected),hints:0,revealed:false,atMs:1000}]}))}};}
function req(data,options={}){return new Request('https://test-worker.example/report',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data),...options});}
test('Payload reconstruction never trusts client-provided scores',()=>{const p=payload();p.session.score=999;const clean=validatePayload(p);assert.equal(clean.session.score,undefined);assert.equal(clean.session.records.length,10);});
test('Reject missing consent, excessive records/attempts, stale engine and forged exam hints',()=>{
 for(const mutate of [p=>p.consent=false,p=>p.engineVersion=99,p=>p.session.records.push(emptyRecord()),p=>p.session.settings.count=100000,p=>p.session.records[0].attempts=Array(9).fill(p.session.records[0].attempts[0]),p=>{p.session.settings.mode='test';p.session.records[0].hints=1;},p=>p.student.name='<\nscript>',p=>p.session.records[0].attempts[0].value='process.exit()',p=>p.session.elapsedMs=999999999]){const p=payload();mutate(p);assert.throws(()=>validatePayload(p));}
});
test('CORS preflight is allowlisted; a hostile origin never reaches Telegram',async()=>{
 const ok=await worker.fetch(req(null,{method:'OPTIONS',body:undefined}),env);assert.equal(ok.status,204);assert.equal(ok.headers.get('Access-Control-Allow-Origin'),origin);
 const bad=await worker.fetch(req(payload(),{headers:{Origin:'https://evil.example','Content-Type':'application/json'}}),env);assert.equal(bad.status,403);assert.equal(bad.headers.get('Access-Control-Allow-Origin'),null);
});
test('Missing server secrets, oversized bodies and exhausted rate limit fail safely',async()=>{
 assert.equal((await worker.fetch(req(payload()),{})).status,503);
 assert.equal((await worker.fetch(req({padding:'x'.repeat(50000)}),env)).status,413);
 assert.equal((await worker.fetch(req(payload()),{...env,REPORT_RATE_LIMITER:{limit:async()=>({success:false})}})).status,429);
});
test('Only an explicit valid POST sends ONE document with fixed server-side recipient, then confirms receipt',async()=>{
 const previous=globalThis.fetch;let calls=0;
 globalThis.fetch=async(url,init)=>{calls++;assert.ok(String(url).endsWith('/sendDocument'));assert.equal(init.body.get('chat_id'),'123');const text=await init.body.get('document').text();assert.match(text,/ОТВЕТЫ И ПОПЫТКИ/);assert.match(text,/С первого раза без помощи: 10 \/ 10/);assert.match(init.body.get('caption'),/10\/10/);return new Response(JSON.stringify({ok:true,result:{message_id:456}}),{status:200,headers:{'Content-Type':'application/json'}});};
 try{const response=await worker.fetch(req(payload()),env);assert.equal(response.status,200);assert.equal(calls,1);const data=await response.json();assert.equal(data.ok,true);assert.equal(data.receipt,'456');assert.equal(data.sessionId,'work-unit-test-12345678');}finally{globalThis.fetch=previous;}
});
test('Telegram errors do not become a fake success or leak upstream error details',async()=>{
 const previous=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({ok:false,description:'sensitive upstream context'}),{status:400});
 try{const r=await worker.fetch(req(payload()),env);assert.equal(r.status,502);const text=await r.text();assert.doesNotMatch(text,/sensitive|placeholder/);assert.match(text,/delivery_unconfirmed/);}finally{globalThis.fetch=previous;}
});
