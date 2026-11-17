/* Telegram relay for Cloudflare Workers Free. No credentials belong in this file.
   Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID as Cloudflare secrets. */
import { ENGINE_VERSION, MODE_LABELS, normalizeSettings, createTasks, checkAnswer, analyze, makeReport, durationText } from '../src/engine.mjs';

const MAX_BYTES = 45000;
const localWindows = new Map();
const defaults = 'https://baikovaalina.github.io';
function json(data, status = 200, origin = '', extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Vary':'Origin', ...(origin ? { 'Access-Control-Allow-Origin':origin } : {}), ...extra } });
}
function integer(x, min, max) { return Number.isInteger(x) && x >= min && x <= max; }
function invalid(message = 'Некорректные данные работы.') { const e=new Error(message);e.status=422;throw e; }
export function validatePayload(raw) {
  if (!raw || raw.engineVersion !== ENGINE_VERSION || raw.consent !== true) invalid();
  const st=raw.student;
  if(!st||typeof st.name!=='string'||st.name.trim().length<2||st.name.trim().length>60||/[\x00-\x1f\x7f]/.test(st.name)||![7,8].includes(st.grade))invalid();
  const student={name:st.name.trim(),grade:st.grade};
  if(typeof raw.comment!=='string'||raw.comment.length>400||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(raw.comment))invalid();
  const s=raw.session;
  if(!s||typeof s.id!=='string'||!/^work-[a-zA-Z0-9-]{8,74}$/.test(s.id)||!integer(s.seed,1,4294967295))invalid();
  if(!s.settings||![7,8].includes(s.settings.level)||!Object.hasOwn(MODE_LABELS,s.settings.mode)||![10,15,20].includes(s.settings.count)||!['all','squares','cubes'].includes(s.settings.topic))invalid();
  const settings=normalizeSettings(s.settings);
  if(!Array.isArray(s.settings.formulaIds)||JSON.stringify(settings.formulaIds)!==JSON.stringify(s.settings.formulaIds))invalid();
  if(!integer(s.startedAt,1577836800000,Date.now()+300000)||!integer(s.finishedAt,s.startedAt,Date.now()+300000)||!integer(s.elapsedMs,0,21600000)||s.elapsedMs>s.finishedAt-s.startedAt+5000)invalid();
  const tasks=createTasks(s.seed,settings),exam=settings.mode==='test';
  if(!Array.isArray(s.records)||s.records.length!==tasks.length)invalid();
  const records=s.records.map((r,i)=>{
    if(!r||!integer(r.hints,0,2)||typeof r.revealed!=='boolean'||typeof r.skipped!=='boolean'||!Array.isArray(r.attempts)||r.attempts.length>8)invalid();
    if(exam&&(r.hints||r.revealed))invalid();
    let prevMs=0,prevHints=0,previousCorrect=false;
    const attempts=r.attempts.map(a=>{
      if(!a||typeof a.value!=='string'||a.value.length>220||!a.value.trim()||/[\x00-\x1f\x7f]/.test(a.value)||!integer(a.hints,prevHints,r.hints)||typeof a.revealed!=='boolean'||a.revealed&&!r.revealed||!integer(a.atMs,prevMs,s.elapsedMs+2000))invalid();
      if(exam&&(a.hints||a.revealed))invalid();
      if(tasks[i].kind==='choice'&&!/^[0-3]$/.test(a.value))invalid();
      const check=checkAnswer(tasks[i],a.value);
      if(check.syntax||!exam&&previousCorrect)invalid();
      previousCorrect=check.correct;prevMs=a.atMs;prevHints=a.hints;
      return {value:a.value,hints:a.hints,revealed:a.revealed,atMs:a.atMs};
    });
    return {attempts,hints:r.hints,revealed:r.revealed,skipped:r.skipped};
  });
  return {student,comment:raw.comment.trim(),session:{id:s.id,seed:s.seed,settings,startedAt:s.startedAt,finishedAt:s.finishedAt,elapsedMs:s.elapsedMs,records}};
}
async function readLimited(request) {
  if(Number(request.headers.get('Content-Length')||0)>MAX_BYTES){const e=new Error('Слишком большой отчёт.');e.status=413;throw e;}
  if(!request.body)invalid();
  const reader=request.body.getReader(),chunks=[];let total=0;
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>MAX_BYTES){await reader.cancel();const e=new Error('Слишком большой отчёт.');e.status=413;throw e;}chunks.push(value);}
  const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{invalid('Нужен корректный JSON.');}
}
async function rateLimit(request,env) {
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  if(env.REPORT_RATE_LIMITER){const result=await env.REPORT_RATE_LIMITER.limit({key:'report:'+ip});return result.success;}
  // Dashboard-only installation fallback: approximate per-isolate, not a global security boundary.
  const now=Date.now();if(localWindows.size>2000){for(const [k,v]of localWindows)if(now-v.start>60000)localWindows.delete(k);if(localWindows.size>2000)localWindows.clear();}
  let bucket=localWindows.get(ip);if(!bucket||now-bucket.start>=60000){bucket={start:now,count:0};localWindows.set(ip,bucket);}return ++bucket.count<=12;
}
async function fingerprint(payload) {const bytes=new TextEncoder().encode(JSON.stringify(payload));const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export default {
  async fetch(request,env,ctx) {
    const url=new URL(request.url),origin=request.headers.get('Origin')||'';
    const allowed=(env.ALLOWED_ORIGINS||defaults).split(',').map(x=>x.trim()).filter(Boolean);
    if(url.pathname==='/health'&&request.method==='GET')return json({ok:true,service:'anichkov-reports',version:ENGINE_VERSION});
    if(!['/report','/api/report'].includes(url.pathname))return json({ok:false,error:'not_found'},404);
    if(!origin||!allowed.includes(origin))return json({ok:false,error:'origin_not_allowed'},403);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'3600','Vary':'Origin'}});
    if(request.method!=='POST')return json({ok:false,error:'method_not_allowed'},405,origin,{'Allow':'POST, OPTIONS'});
    if(!(request.headers.get('Content-Type')||'').toLowerCase().startsWith('application/json'))return json({ok:false,error:'json_required'},415,origin);
    if(!env.TELEGRAM_BOT_TOKEN||!env.TELEGRAM_CHAT_ID)return json({ok:false,error:'teacher_setup_required'},503,origin);
    try {
      const raw=await readLimited(request),payload=validatePayload(raw);
      const cache=typeof caches!=='undefined'?caches.default:null;
      const cacheKey=new Request(url.origin+'/__receipt/'+await fingerprint(payload));
      if(cache){try{const previous=await cache.match(cacheKey);if(previous)return json(await previous.json(),200,origin);}catch{/* Cache is best-effort. */}}
      if(!await rateLimit(request,env))return json({ok:false,error:'rate_limited'},429,origin,{'Retry-After':'60'});
      const {session,student,comment}=payload,tasks=createTasks(session.seed,session.settings),stats=analyze(tasks,session.records);
      const caption=[`📓 Аничков · Формулы сокращённого умножения`,`${student.name} · ${student.grade} класс`,MODE_LABELS[session.settings.mode],'',`С первого раза без помощи: ${stats.first}/${stats.total} (${stats.percent}%)`,`Верно в итоге: ${stats.solved}/${stats.total}`,`Самостоятельно с исправлениями: ${stats.independent}`,`Заданий с подсказками: ${stats.hinted} · разборов: ${stats.revealed}`,`Время в тренажёре: ${durationText(session.elapsedMs)}`,'',`Все задания, ответы и попытки — в файле.`,`Код: ${session.id.slice(-12)}`].join('\n');
      const text=makeReport(session,student,comment),form=new FormData();
      form.set('chat_id',String(env.TELEGRAM_CHAT_ID));form.set('caption',caption);
      form.set('document',new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}),'anichkov-'+session.id.slice(-12)+'.txt');
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),14000);
      let response,body;
      try{response=await fetch('https://api.telegram.org/bot'+env.TELEGRAM_BOT_TOKEN+'/sendDocument',{method:'POST',body:form,signal:controller.signal});body=await response.json();}catch{return json({ok:false,error:'delivery_unconfirmed'},502,origin);}finally{clearTimeout(timer);}
      // Never log, expose, or forward Telegram's error body: it may contain sensitive context.
      if(!response.ok||body.ok!==true||!body.result?.message_id)return json({ok:false,error:'delivery_unconfirmed'},502,origin);
      const receipt={ok:true,sessionId:session.id,receipt:String(body.result.message_id)};
      if(cache){const cached=new Response(JSON.stringify(receipt),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=86400'}});const promise=cache.put(cacheKey,cached).catch(()=>{});if(ctx?.waitUntil)ctx.waitUntil(promise);else await promise;}
      return json(receipt,200,origin);
    }catch(e){return json({ok:false,error:e.status===413?'payload_too_large':e.status===422?'invalid_work':'internal_error'},e.status||500,origin);}
  }
};
