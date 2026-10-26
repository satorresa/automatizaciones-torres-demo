const clean=(value,max)=>typeof value==='string'?value.trim().replace(/\r\n/g,'\n').slice(0,max):'';
export function prepareLocalBrief(input={},context={}){
 const entry=clean(input.entry,400),decision=clean(input.decision,300),output=clean(input.output,400),tools=clean(input.tools,200),errors=[];
 if(entry.length<8)errors.push('entry');if(decision.length<8)errors.push('decision');if(output.length<8)errors.push('output');
 const volume=input.volume===''||input.volume==null?null:Number(input.volume),minutes=input.minutes===''||input.minutes==null?null:Number(input.minutes);
 if(volume!==null&&(!Number.isSafeInteger(volume)||volume<0||volume>100000))errors.push('volume');if(minutes!==null&&(!Number.isFinite(minutes)||minutes<0||minutes>480))errors.push('minutes');
 if(errors.length)return{ok:false,errors};const en=context.language==='en',title=clean(context.title,180),path=typeof context.path==='string'&&/^\/(?:[a-z0-9-]+\/?)*$/.test(context.path)?context.path:'/';
 const rows=[en?'Automatizaciones Torres · A workflow to explore':'Automatizaciones Torres · Un recorrido para explorar',title,'https://demo.automatizacionestorres.com'+path,'',en?'What comes in':'Qué llega',entry,'',en?'Who decides and what they confirm':'Quién decide y qué confirma',decision,'',en?'What should come out':'Qué debe salir',output];
 if(tools)rows.push('',en?'Tools already in use':'Herramientas actuales',tools);
 if(volume!==null)rows.push('',(en?'Declared cases per month: ':'Casos declarados al mes: ')+volume);if(minutes!==null)rows.push((en?'Declared minutes per case: ':'Minutos declarados por caso: ')+minutes);
 if(volume!==null&&minutes!==null)rows.push((en?'Declared workload (not savings): ':'Carga declarada (no es ahorro): ')+(volume*minutes/60).toFixed(1)+(en?' h/month':' h/mes'));
 rows.push('',en?'Scope, access, acceptance and pricing remain to be agreed. This brief was generated locally; no message or case was submitted.':'Alcance, accesos, aceptación y precio quedan por acordar. Esta ficha se generó localmente; no se envió un mensaje ni un caso.');return{ok:true,text:rows.join('\n'),workloadHours:volume!==null&&minutes!==null?volume*minutes/60:null};
}
