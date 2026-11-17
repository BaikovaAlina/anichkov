/* Start `npm run preview` in another terminal, then run `node tests/browser.smoke.mjs`.
   Telegram delivery is MOCKED. No real token, account or recipient is used. */
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
import {createTasks} from '../src/engine.mjs';
const url=process.env.TEST_URL||'http://127.0.0.1:3000';
const artifacts=new URL('../test-results/',import.meta.url);await mkdir(artifacts,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[],reports=[];
async function setup(width=1440,height=1000){const p=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.evaluate(()=>document.fonts.ready);return p;}
const click=(p,a)=>p.locator('#view [data-action="'+a+'"]').click();
const stored=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('anichkov.algebra.v1')));
async function answer(p,t,value){if(t.kind==='choice')await p.locator('[data-action="select-choice"][data-index="'+value+'"]').click();else await p.locator('#answer-input').fill(String(value));await click(p,'check-answer');}
try{
 const p=await setup();
 await p.screenshot({path:new URL('home-desktop.png',artifacts).pathname,fullPage:true});
 await p.locator('.top-nav [data-route="formulas"]').click();assert.equal(await p.locator('.formula-card').count(),7);
 await p.locator('[data-action="master"]').first().click();assert.match(await p.locator('#mastery-caption').textContent(),/^1/);
 await p.reload();assert.match(await p.locator('#mastery-caption').textContent(),/^1/);
 await p.locator('[data-action="flip"]').first().click();assert.match(await p.locator('.formula-card').first().textContent(),/Запомни словами/);
 await p.locator('[data-action="open-lesson"]').first().click();assert.match(await p.locator('h1').textContent(),/Квадрат суммы/);
 await click(p,'lesson-next');assert.match(await p.locator('h1').textContent(),/Квадрат разности/);
 await p.locator('[data-action="profile"]').click();await p.locator('#student-name').fill('Тестовый ученик');await p.locator('#student-grade').selectOption('8');await p.locator('#profile-form button[type=submit]').click();
 await p.locator('.top-nav [data-route="practice"]').click();
 await p.locator('[data-key="mode"][data-value="expand"]').click();await click(p,'start-session');
 let active=(await stored(p)).active;const tasks=createTasks(active.seed,active.settings);
 for(let i=0;i<tasks.length;i++){
  const t=tasks[i];
  if(i===0){await answer(p,t,'0');assert.match(await p.locator('.feedback').textContent(),/Пока не получилось/);await click(p,'hint');}
  if(i===1){await click(p,'hint');await click(p,'reveal');assert.equal(await p.locator('.solution-box').count(),1);}
  else {await answer(p,t,t.expected);assert.match(await p.locator('.feedback').textContent(),/верно|Верно/);}
  if(i===2){await p.reload();assert.match(await p.locator('h1').textContent(),/Задание 3/);}
  if(i===4)await p.screenshot({path:new URL('practice-desktop.png',artifacts).pathname,fullPage:true});
  await click(p,'next-question');
 }
 await p.locator('[data-action="finish-confirm"]').click();
 assert.match(await p.locator('.score-ring strong').textContent(),/8\/10/);
 await p.screenshot({path:new URL('results-desktop.png',artifacts).pathname,fullPage:true});
 await p.locator('[data-action="result-tab"][data-value="answers"]').click();assert.equal(await p.locator('.answer-detail').count(),10);
 const downloadPromise=p.waitForEvent('download');await click(p,'download-report');const download=await downloadPromise;const file=await download.path();const txt=await readFile(file,'utf8');assert.match(txt,/Попытка 2/);assert.match(txt,/Тестовый ученик/);
 await click(p,'report');assert.equal(await p.locator('#confirm-send').isDisabled(),true);assert.match(await p.locator('#send-status').textContent(),/пока не подключён/);await p.locator('.modal-close').click();
 await p.evaluate(()=>window.ANICHKOV_CONFIG.reportEndpoint='https://reports.example.test/report');
 await p.route('https://reports.example.test/**',async route=>{if(route.request().method()==='OPTIONS'){await route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST'}});return;}const payload=route.request().postDataJSON();reports.push(payload);await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({ok:true,receipt:'MOCK-123',sessionId:payload.session.id})});});
 assert.equal(reports.length,0);await click(p,'report');await p.locator('input[name="consent"]').check();assert.equal(reports.length,0);await p.locator('#confirm-send').click();await p.locator('.modal h2').filter({hasText:'Отчёт у учителя'}).waitFor();assert.equal(reports.length,1);assert.equal(reports[0].session.records[0].hints,1);assert.equal(reports[0].session.records[0].attempts.length,2);assert.equal((await stored(p)).history[0].sent,true);
 await p.locator('[data-action="close-modal"]').last().click();
 await p.locator('.sidebar [data-action="open-test"]').click();await click(p,'start-session');
 active=(await stored(p)).active;const examTasks=createTasks(active.seed,active.settings);
 assert.equal(await p.locator('[data-action="hint"]').count(),0);
 for(let i=0;i<examTasks.length;i++){
  const t=examTasks[i];await answer(p,t,t.kind==='choice'?t.correctIndex:t.expected);assert.match(await p.locator('.feedback').textContent(),/Ответ сохранён/);assert.doesNotMatch(await p.locator('.feedback').textContent(),/Верно/);await click(p,'next-question');
 }
 assert.match(await p.locator('.score-ring strong').textContent(),/10\/10/);assert.equal(reports.length,1,'No auto-send after second completed work');
 await p.close();
 for(const width of [360,390,768]){
  const mobile=await setup(width,900);assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'home overflow '+width);
  if(width===390)await mobile.screenshot({path:new URL('home-mobile.png',artifacts).pathname,fullPage:true});
  for(const tab of ['formulas','practice','history']){await mobile.locator('.top-nav [data-route="'+tab+'"]').click();assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,tab+' overflow '+width);}
  await mobile.locator('.top-nav [data-route="practice"]').click();await mobile.locator('[data-key="level"][data-value="8"]').click();await click(mobile,'start-session');assert.equal(await mobile.locator('.question-panel').count(),1);assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'task overflow '+width);if(width===390)await mobile.screenshot({path:new URL('practice-mobile.png',artifacts).pathname,fullPage:true});await mobile.close();
 }
 const sandbox=await browser.newPage();sandbox.on('pageerror',e=>errors.push('sandbox: '+e.message));const html=await readFile(new URL('../index.html',import.meta.url),'utf8');await sandbox.setContent('<iframe sandbox="allow-scripts" style="width:100%;height:900px"></iframe>');await sandbox.locator('iframe').evaluate((el,html)=>el.srcdoc=html,html);const frame=sandbox.frames().at(-1);await frame.locator('h1').waitFor();assert.equal(await frame.locator('#storage-warning').isVisible(),true);await frame.locator('[data-action="quick-start"]').click();assert.equal(await frame.locator('.question-panel').count(),1);await sandbox.close();
 assert.deepEqual(errors,[]);console.log('PASS: desktop, phone (360/390), tablet, algebra answers, corrections, hints, reveal, saved progress, download, exam, no auto-send, mocked delivery, and opaque-origin file preview. Real Telegram was NOT contacted.');
}finally{await browser.close();}
