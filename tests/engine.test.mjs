import test from 'node:test';
import assert from 'node:assert/strict';
import { FORMULAS, createTasks, checkAnswer, parsePolynomial, equivalent, expand, analyze, emptyRecord, makeReport, normalizeSettings } from '../src/engine.mjs';

test('All seven identities and all teaching examples are algebraically correct',()=>{
 for(const f of FORMULAS){assert.ok(equivalent(f.lhs,f.rhs),f.title);assert.ok(equivalent(f.example,f.answer),f.title+' example');}
});
test('Exact symbolic comparison supports ordering, Cyrillic lookalikes, implicit products, Unicode powers and decimals',()=>{
 for(const [a,b]of [['(2x-3y)^3','8x^3-36x^2y+54xy^2-27y^3'],['х²+6х+9','9+6*x+x*x'],['(a-b)(a+b)','a²-b²'],['(0,5x+2)^2','x^2/4+2x+4'],['-(x-1)^2','-x^2+2x-1'],['(3a+2b)^2','9aa+12ab+4bb']])assert.ok(equivalent(a,b),a);
 assert.equal(equivalent('(x+2)^2','x^2+4'),false);
 assert.equal(expand('(2x-3)^2'),'4x^2-12x+9');
});
test('No code execution, arbitrary names, variable denominators, gigantic powers or malformed expressions',()=>{
 for(const s of ['alert(1)','window.x','process.exit()','x;1','x=2','x^10000','2/(x+1)','x^-2','x**2','(x+1','x+','Infinity','<img src=x>','2..3','x^2^2',''])assert.throws(()=>parsePolynomial(s),s);
});
test('Equivalent but untransformed answers do not pass expansion/factor drills',()=>{
 const ex={kind:'expand',expected:'x^2+6x+9',formula:FORMULAS[0]};
 assert.ok(checkAnswer(ex,'9+6x+x²').correct);
 assert.equal(checkAnswer(ex,'(x+3)^2').correct,false);
 assert.ok(checkAnswer(ex,'(x+3)^2').formError);
 const factor={kind:'factor',expected:'(x-3)(x+3)',formula:FORMULAS[2]};
 for(const a of ['(x+3)*(x-3)','(−x+3)(−x−3)'])assert.ok(checkAnswer(factor,a).correct,a);
 for(const a of ['x²−9','1*(x²−9)','(x²−9)*1'])assert.equal(checkAnswer(factor,a).correct,false,a);
});
test('Every generated model passes; distractors are wrong; topics stay consistent (100,000 tasks)',()=>{
 let seen=new Set();
 for(let seed=1;seed<=500;seed++)for(const level of [7,8])for(const mode of ['mixed','memory','expand','factor','test'])for(const t of createTasks(seed,{level,mode,count:20})){
   seen.add(t.kind);assert.ok(checkAnswer(t,t.kind==='choice'?String(t.correctIndex):t.expected).correct,JSON.stringify(t));
   assert.ok(t.formula.grade<=level);assert.equal(t.formulaId,t.formula.id);
   if(t.kind==='choice')for(let i=0;i<t.options.length;i++)assert.equal(checkAnswer(t,String(i)).correct,i===t.correctIndex);
 }
 assert.deepEqual([...seen].sort(),['choice','expand','factor','fill']);
});
test('Generation is reproducible and subject targeting is respected',()=>{
 const a=createTasks(12345,{level:8,count:20,mode:'mixed'});assert.deepEqual(a,createTasks(12345,{level:8,count:20,mode:'mixed'}));
 assert.notDeepEqual(a,createTasks(12346,{level:8,count:20,mode:'mixed'}));
 for(const id of FORMULAS.map(f=>f.id))for(const mode of ['mixed','memory','expand','factor']){
   const tasks=createTasks(12,{level:8,count:20,mode,formulaIds:[id]});assert.ok(tasks.every(t=>t.formulaId===id));
 }
 assert.equal(normalizeSettings({level:7,topic:'cubes',count:999}).count,10);
});
test('A hint, correction or revealed solution never inflates first-attempt independent success',()=>{
 const tasks=createTasks(21,{mode:'expand',count:10});
 const r=tasks.map(()=>emptyRecord());
 const attempt=(t,extra={})=>({value:t.expected,hints:0,revealed:false,atMs:1000,...extra});
 r[0].attempts=[attempt(tasks[0])];
 r[1].attempts=[{...attempt(tasks[1]),value:'0'},attempt(tasks[1])];
 r[2].hints=1;r[2].attempts=[attempt(tasks[2],{hints:1})];
 r[3].revealed=true;
 const s=analyze(tasks,r);
 assert.equal(s.first,1);assert.equal(s.solved,3);assert.equal(s.independent,2);assert.equal(s.assisted,1);assert.equal(s.revealed,1);assert.equal(s.unanswered,7);assert.equal(s.attempts,4);
 const report=makeReport({id:'work-test-1234',seed:21,settings:{level:7,mode:'expand',count:10},records:r,elapsedMs:1000,finishedAt:Date.now()},{name:'Тест',grade:7},'Нужно повторить');
 assert.match(report,/Попытка 2/);assert.match(report,/открыт разбор|разбор: открыт/);assert.match(report,/Нужно повторить/);
});
