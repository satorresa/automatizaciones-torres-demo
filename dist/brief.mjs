export const DEMO_IDS = Object.freeze(['packet','order','stock','equipment','receipt','opportunity']);
export const DEMO_ORIGIN = 'https://demo.automatizacionestorres.com';
export function readContext(search='') {
  const q=new URLSearchParams(search),raw=q.get('origen')||'';
  return {caseId:DEMO_IDS.includes(q.get('caso'))?q.get('caso'):'packet',language:q.get('idioma')==='en'?'en':'es',origin:/^[a-z0-9][a-z0-9_-]{0,39}$/.test(raw)?raw:''};
}
export function caseLink({caseId,language='es',origin=''}) {
  const safe=readContext(new URLSearchParams({caso:caseId,idioma:language,origen:origin}).toString());
  const url=new URL(DEMO_ORIGIN);url.searchParams.set('caso',safe.caseId);url.searchParams.set('idioma',safe.language);if(safe.origin)url.searchParams.set('origen',safe.origin);url.hash='laboratorio';return url.href;
}
const clean=(value,max)=>typeof value==='string'?value.normalize('NFC').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').trim().slice(0,max):'';
export function prepareBrief(input,context) {
  const en=context.language==='en',errors=[];
  const fields={entry:clean(input.entry,400),output:clean(input.output,400),approval:clean(input.approval,220),tools:clean(input.tools,160)};
  for(const [key,min]of [['entry',15],['output',15],['approval',5]])if(fields[key].length<min)errors.push(key);
  const number=(raw,max,integer)=>{if(raw===undefined||raw===null||typeof raw==='string'&&raw.trim()==='')return null;if(typeof raw!=='number'&&typeof raw!=='string')return NaN;const value=Number(raw);return Number.isFinite(value)&&value>=0&&value<=max&&(!integer||Number.isInteger(value))?value:NaN;};
  const volume=number(input.volume,100000,true),minutes=number(input.minutes,480,false);
  if(Number.isNaN(volume))errors.push('volume');if(Number.isNaN(minutes))errors.push('minutes');
  if(errors.length)return {ok:false,errors};
  const relationship=input.relationship==='agency'?'agency':'business',link=caseLink(context),load=volume!==null&&minutes!==null?volume*minutes/60:null;
  const lines=en?[
    'Hi Jair. This is the first workflow we would like to explore.',
    relationship==='agency'?'We are exploring this for a client of our agency.':'We are exploring this for our own business.',
    'Example selected — '+clean(context.name,100),
    'What arrives and where it comes from\n'+fields.entry,
    'The output we want to put to the test\n'+fields.output,
    'The decision a person must keep\n'+fields.approval,
    ...(fields.tools?['Tools already involved\n'+fields.tools]:[]),
    ...(volume!==null?['Cases per week stated by us — '+volume]:[]),
    ...(minutes!==null?['Current minutes per case stated by us — '+minutes]:[]),
    ...(load!==null?['Current workload from these inputs — '+load.toFixed(2)+' hours per week. This is not a saving estimate.']:[]),
    'We would compare the complete time, including review, and unresolved exceptions on an agreed sample. Scope, access, price and timing remain to be agreed.',
    'Example — '+link,
    ...(context.origin?['Conversation reference — '+readContext(new URLSearchParams({origen:context.origin})).origin]:[])
  ]:[
    'Hola, Jair. Este es el primer recorrido que nos gustaría explorar.',
    relationship==='agency'?'Lo exploramos para un cliente de nuestra agencia.':'Lo exploramos para nuestra propia empresa.',
    'Ejemplo elegido — '+clean(context.name,100),
    'Qué llega y por dónde\n'+fields.entry,
    'La salida que queremos poner a prueba\n'+fields.output,
    'La decisión que debe conservar una persona\n'+fields.approval,
    ...(fields.tools?['Herramientas que ya intervienen\n'+fields.tools]:[]),
    ...(volume!==null?['Casos por semana que declaramos — '+volume]:[]),
    ...(minutes!==null?['Minutos actuales por caso que declaramos — '+minutes]:[]),
    ...(load!==null?['Carga actual según estos datos — '+load.toFixed(2)+' horas por semana. No es una estimación de ahorro.']:[]),
    'Compararíamos el tiempo completo, incluida la revisión, y las excepciones pendientes en una muestra acordada. Alcance, accesos, precio y fechas están por acordar.',
    'Ejemplo — '+link,
    ...(context.origin?['Referencia de conversación — '+readContext(new URLSearchParams({origen:context.origin})).origin]:[])
  ];
  const text=lines.join('\n\n');return {ok:true,text,loadHours:load,relationship,caseId:readContext(new URLSearchParams({caso:context.caseId})).caseId,mailto:'mailto:automatizaciones.storres@gmail.com?'+new URLSearchParams({subject:en?'A concrete first workflow':'Un primer recorrido concreto',body:text}),whatsapp:'https://wa.me/573105497003?'+new URLSearchParams({text})};
}
const COPY={es:{label:'DEL EJEMPLO A TU OPERACIÓN',title:'Trae un caso. Sal con una prueba por definir.',intro:'Describe la entrada, la salida y la decisión que debe conservar tu equipo. Prepararemos una ficha para conversar con Jair, también si trabajas desde una agencia.',privacy:'Se prepara sólo en este navegador. No se guarda ni se envía al completar el formulario. Evita nombres de clientes, contraseñas o datos sensibles. Revisa el texto antes de compartirlo.',relationship:'¿Para quién exploras este recorrido?',business:'Para mi empresa',agency:'Para un cliente de mi agencia',entry:'Qué llega y por dónde',entryHint:'Por ejemplo, solicitudes de mantenimiento por correo y anexos en una carpeta.',output:'Qué salida necesita el siguiente responsable',outputHint:'Por ejemplo, una orden con anexos completos y diferencias por revisar.',approval:'Qué debe seguir decidiendo una persona',approvalHint:'Por ejemplo, autorizar el alcance y dar el caso por cerrado.',tools:'Herramientas actuales, si las conoces',volume:'Casos por semana, opcional',minutes:'Minutos actuales por caso, opcional',note:'La carga actual no es ahorro. La comparación deberá incluir la revisión y las excepciones.',prepare:'Preparar mi ficha ↗',preview:'Revisa lo que compartirías',download:'Descargar ficha ↓',email:'Compartir por correo ↗',whatsapp:'Conversar con Jair por WhatsApp ↗',empty:'La ficha aparecerá aquí cuando completes la entrada, la salida y la decisión. Puedes usar descripciones generales, sin datos de terceros.',stale:'Cambiaste el caso. Prepara de nuevo la ficha antes de compartirla.',error:'Completa la entrada y la salida con al menos 15 caracteres, y la decisión con 5. Usa cantidades positivas o cero dentro del rango indicado.',share:'Enlace de este ejemplo',copy:'Copiar enlace',copied:'Enlace copiado',fallback:'Puedes seleccionar y copiar el enlace de abajo.',selected:'El ejemplo elegido',noSavings:'Las cifras describen tu carga actual. No prometen ahorro ni reemplazan un diagnóstico.',sendNote:'El enlace abre tu aplicación. El envío lo confirmas allí.'},en:{label:'FROM THE EXAMPLE TO YOUR WORK',title:'Bring a case. Leave with a test to define.',intro:'Describe the input, output and decision your team must keep. Prepare a brief to discuss with Jair, including when you work through an agency.',privacy:'Prepared only in this browser. Completing this form does not store or send anything. Avoid client names, passwords or sensitive data. Review the text before sharing.',relationship:'Who is this workflow for?',business:'Our business',agency:'A client of our agency',entry:'What arrives and where it comes from',entryHint:'For example, maintenance requests by email and attachments in a folder.',output:'What output the next person needs',outputHint:'For example, an order with complete attachments and differences to review.',approval:'What a person must continue deciding',approvalHint:'For example, approving scope and closing the case.',tools:'Current tools, if known',volume:'Cases per week, optional',minutes:'Current minutes per case, optional',note:'Current workload is not a saving. Comparison must include review and exceptions.',prepare:'Prepare my brief ↗',preview:'Review what you would share',download:'Download brief ↓',email:'Share by email ↗',whatsapp:'Discuss with Jair on WhatsApp ↗',empty:'Your brief will appear here when you describe the input, output and decision. General descriptions are enough, without third-party data.',stale:'The case changed. Prepare the brief again before sharing.',error:'Describe the input and output using at least 15 characters, and the decision using 5. Use non-negative numbers within the indicated range.',share:'Link to this example',copy:'Copy link',copied:'Link copied',fallback:'Select and copy the link below.',selected:'Selected example',noSavings:'These figures describe current workload. They do not promise savings or replace discovery.',sendNote:'The link opens your application. You confirm sending there.'}};
export function mountBrief({document:doc,navigator:nav}) {
  const root=doc.getElementById('brief-builder');if(!root)return {setContext(){}};
  const el=id=>doc.getElementById('brief-'+id),fields=['entry','output','approval','tools','volume','minutes','relationship'];let context=null,last=null;
  function invalidate(message){last=null;el('result').hidden=true;el('status').textContent=message||COPY[context?.language||'es'].empty;for(const id of ['email','whatsapp'])el(id).removeAttribute('href');}
  function prepare(){const input=Object.fromEntries(fields.map(k=>[k,el(k).value])),r=prepareBrief(input,context);for(const k of fields)el(k).removeAttribute('aria-invalid');if(!r.ok){invalidate(COPY[context.language].error);for(const k of r.errors)el(k).setAttribute('aria-invalid','true');el(r.errors[0]).focus();return;}last=r;el('text').value=r.text;el('email').href=r.mailto;el('whatsapp').href=r.whatsapp;el('result').hidden=false;el('status').textContent=COPY[context.language].noSavings;}
  el('form').addEventListener('submit',event=>{event.preventDefault();prepare();});el('form').addEventListener('input',()=>invalidate(COPY[context.language].stale));
  el('download').addEventListener('click',()=>{if(!last)return;const url=URL.createObjectURL(new Blob([last.text],{type:'text/plain;charset=utf-8'})),a=doc.createElement('a');a.href=url;a.download='torres-primer-recorrido.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  el('copy').addEventListener('click',async()=>{try{if(!nav?.clipboard?.writeText)throw Error('clipboard unavailable');await nav.clipboard.writeText(el('link').value);el('copy-status').textContent=COPY[context.language].copied;}catch{el('copy-status').textContent=COPY[context.language].fallback;el('link').focus();el('link').select();}});
  return {setContext(next){context=next;const words=COPY[next.language];doc.querySelectorAll('[data-brief-start]').forEach(x=>x.textContent=next.language==='en'?'Bring my case ↗':'Traer mi caso ↗');root.querySelectorAll('[data-brief]').forEach(x=>x.textContent=words[x.dataset.brief]||'');for(const k of ['entry','output','approval'])el(k).placeholder=words[k+'Hint'];el('selected').textContent=words.selected+' · '+next.name;el('link').value=caseLink(next);el('copy-status').textContent='';invalidate(words.empty);}};
}
