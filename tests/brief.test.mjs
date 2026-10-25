import test from 'node:test';
import assert from 'node:assert/strict';
import {readContext,caseLink,prepareBrief,DEMO_IDS} from '../dist/brief.mjs';
const context={caseId:'equipment',language:'es',name:'Servicio por equipo',origin:'aliados_20261022'};
const input={entry:'Una solicitud de servicio llega por correo con sus anexos.',output:'Una orden completa con las diferencias pendientes de revisión.',approval:'El responsable autoriza el alcance.',tools:'Correo y hoja',relationship:'agency'};
test('every supported workflow has an exact deep link that round trips',()=>{for(const caseId of DEMO_IDS){const link=new URL(caseLink({...context,caseId}));assert.equal(link.hash,'#laboratorio');assert.deepEqual(readContext(link.search),{caseId,language:'es',origin:context.origin});}});
test('untrusted query values never become redirects, HTML or recipient details',()=>{const c=readContext('?caso=javascript%3Aalert(1)&idioma=xx&origen=someone%40example.com');assert.deepEqual(c,{caseId:'packet',language:'es',origin:''});assert.equal(new URL(caseLink(c)).origin,'https://demo.automatizacionestorres.com');});
test('origin and language boundaries are enforced',()=>{assert.equal(readContext('?origen='+'a'.repeat(41)).origin,'');assert.equal(readContext('?origen=SOCIO').origin,'');assert.equal(readContext('?idioma=en&origen=partner-31').language,'en');});
test('a useful brief requires input, output and a retained human decision',()=>{const r=prepareBrief({entry:'',output:'x',approval:''},context);assert.equal(r.ok,false);assert.deepEqual(r.errors,['entry','output','approval']);assert.equal(r.whatsapp,undefined);});
test('optional measurements are never invented',()=>{const r=prepareBrief(input,context);assert.equal(r.ok,true);assert.equal(r.loadHours,null);assert.ok(!r.text.includes('horas por semana'));assert.equal(r.relationship,'agency');});
test('workload arithmetic includes zero and never labels it as a saving',()=>{let r=prepareBrief({...input,volume:'20',minutes:'15'},context);assert.equal(r.loadHours,5);assert.ok(r.text.includes('No es una estimación de ahorro'));r=prepareBrief({...input,volume:'0',minutes:'0'},context);assert.equal(r.loadHours,0);});
test('one measurement alone cannot produce a workload estimate',()=>{assert.equal(prepareBrief({...input,volume:'20'},context).loadHours,null);assert.equal(prepareBrief({...input,minutes:'15'},context).loadHours,null);});
test('invalid or deceptive numeric values block sharing',()=>{for(const value of [-1,100001,1.5,Infinity,NaN,{},[],false,'not a number']){const r=prepareBrief({...input,volume:value},context);assert.equal(r.ok,false,String(value));assert.ok(r.errors.includes('volume'));}for(const value of [-1,481,Infinity,{},false])assert.equal(prepareBrief({...input,minutes:value},context).ok,false);});
test('sharing uses only the fixed commercial contact and preserves reviewed text',()=>{const r=prepareBrief(input,context),wa=new URL(r.whatsapp);assert.equal(wa.origin,'https://wa.me');assert.equal(wa.pathname,'/573105497003');assert.equal(wa.searchParams.get('text'),r.text);assert.ok(r.mailto.startsWith('mailto:automatizaciones.storres@gmail.com?'));assert.equal(new URLSearchParams(r.mailto.split('?')[1]).get('body'),r.text);});

test('all bilingual briefs and shared links use the custom demo origin without trusting a caller URL',()=>{
  for(const language of ['es','en'])for(const caseId of DEMO_IDS){
    const current={...context,caseId,language,origin:'https://attacker.example'};
    const link=new URL(caseLink(current));
    assert.equal(link.origin,'https://demo.automatizacionestorres.com');
    assert.equal(link.searchParams.get('caso'),caseId);
    assert.equal(link.searchParams.has('origen'),false);
    const brief=prepareBrief(input,current);
    assert.equal(brief.ok,true);
    assert.ok(brief.text.includes('https://demo.automatizacionestorres.com/'));
    assert.ok(!brief.text.includes('tunedrice6.chatgpt.site'));
    assert.equal(new URLSearchParams(brief.mailto.split('?')[1]).get('body'),brief.text);
    assert.equal(new URL(brief.whatsapp).searchParams.get('text'),brief.text);
  }
});
test('user descriptions never enter the shareable page URL',()=>{const r=prepareBrief({...input,entry:'A private draft description with a hypothetical customer name'},context),line=r.text.split('\n\n').find(x=>x.startsWith('Ejemplo — '));assert.ok(line);assert.ok(!line.includes('private'));assert.ok(line.includes('caso=equipment'));});
test('texts are bounded and control characters removed without executing markup',()=>{const r=prepareBrief({...input,entry:'<script>alert(1)</script>\u0000'+'a'.repeat(600)},context);assert.equal(r.ok,true);assert.ok(!r.text.includes('\u0000'));assert.ok(!r.text.includes('a'.repeat(401)));assert.equal(new URL(r.whatsapp).searchParams.get('text'),r.text);});
test('English and direct business paths are truthful and preserve boundaries',()=>{const r=prepareBrief({...input,relationship:'business',volume:4,minutes:12},{...context,language:'en'});assert.equal(r.ok,true);assert.ok(r.text.includes('own business'));assert.ok(r.text.includes('not a saving estimate'));assert.ok(r.text.includes('price and timing remain to be agreed'));});
