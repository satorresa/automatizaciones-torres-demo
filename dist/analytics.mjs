/** Public-site analytics only. No CRM join, form capture, transport before consent or send authority. */
// Public web-stream ID verified by the coordinator in the native GA4 UI, 25 Oct 2026.
export const DEFAULT_MEASUREMENT_ID = 'G-GGMRJRJKQF';
const CONSENT_KEY='torres-analytics-consent-v1';
const EXAMPLES=['packet','order','stock','equipment','receipt','opportunity','evidence-workspace','document-consistency','order-operations','customer-order-portal','commerce-operations','transport-settlement','operations-product-design','commercial-operations','private-case-intake'];
const SECTIONS=['home','approach','intake','faq','contact','lab','brief','collaborate','developments','case','simulation','result','principles'];
const PLACEMENTS=['header','hero','footer','brief','collaborate'];
const enumOf=values=>value=>values.includes(value);
const language=enumOf(['es','en']);
const field=(test,required=true)=>({test,required});
const example=field(enumOf(EXAMPLES));
const relationship=field(enumOf(['business','agency']));
const EVENT_RULES=Object.freeze({
 page_view:{},
 section_view:{section_id:field(enumOf(SECTIONS))},
 workflow_example_view:{example_id:example},
 demo_case_select:{example_id:example},
 demo_evaluate:{example_id:example,result_category:field(enumOf(['ready','needs_review','invalid','blocked','unchanged']))},
 brief_prepared:{example_id:example,relationship_type:relationship},
 brief_download:{example_id:example,relationship_type:relationship},
 contact_intent:{channel:field(enumOf(['email','whatsapp'])),placement:field(enumOf(PLACEMENTS)),example_id:field(enumOf(EXAMPLES),false)},
 intake_start:{},
 intake_step_complete:{form_id:field(value=>value==='case_intake'),step_number:field(value=>Number.isInteger(value)&&value>=1&&value<=4)},
 intake_submit_attempt:{has_attachment:field(value=>typeof value==='boolean')},
 generate_lead:{lead_source:field(value=>value==='main_intake')},
 intake_status:{operation:field(enumOf(['intake','status','verification','booking','availability'])),status_category:field(enumOf(['received','pending','uncertain','error','rate_limited','configuration_required','conflict','verified','confirmed']))},
 booking_confirmed:{},language_change:{},demo_open:{},
 faq_open:{faq_id:field(value=>Number.isInteger(value)&&value>=1&&value<=4)},
});
const ORIGINS={main:'https://automatizacionestorres.com',demo:'https://demo.automatizacionestorres.com'};
const HOSTS={main:['automatizacionestorres.com','www.automatizacionestorres.com'],demo:['demo.automatizacionestorres.com']};
// Exact, public document paths only. These are not prefixes and never come from a visitor value.
export const ANALYTICS_PATHS=Object.freeze({
 main:Object.freeze(['/','/recorrido','/desarrollos','/conversemos','/en','/en/approach','/en/developments','/en/contact']),
 demo:Object.freeze(['/','/en','/laboratorio','/en/lab','/expedientes','/en/document-review','/revision-documental','/en/document-consistency','/pedidos','/en/order-operations','/portal-de-pedidos','/en/customer-order-portal','/tienda-y-operacion','/en/commerce-operations','/transporte-y-liquidacion','/en/transport-settlement','/producto-financiero-operativo','/en/operations-product-design','/operacion-comercial','/en/commercial-operations','/recepcion-de-casos','/en/private-case-intake','/laboratorio/expedientes','/en/lab/document-review','/laboratorio/pedidos','/en/lab/order-changes','/laboratorio/inventario','/en/lab/inventory-availability','/laboratorio/equipos','/en/lab/equipment-service','/laboratorio/conciliacion','/en/lab/receipt-reconciliation','/laboratorio/seguimiento-comercial','/en/lab/commercial-follow-up'])
});
// Finite aliases for static-host directory redirects. Never strip arbitrary slashes or suffixes.
const PATH_ALIASES=Object.freeze(Object.fromEntries(Object.entries(ANALYTICS_PATHS).map(([surface,paths])=>[
 surface,Object.freeze(Object.fromEntries(paths.filter(path=>path!=='/').map(path=>[path+'/',path])))
])));
const TITLES={main:'Automatizaciones Torres - Business workflows',demo:'Automatizaciones Torres - Working demonstrations'};
const DENIED={analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'};
const GRANTED={...DENIED,analytics_storage:'granted'};
const outcome=(accepted,sent,reason)=>({accepted,sent,reason});

export function validMeasurementId(value){
 return typeof value==='string'&&/^G-[A-Z0-9]{10}$/.test(value)&&!/^G-(?:X{10}|0{10})$/.test(value);
}
export function safePageLocation(location,surface='main'){
 const origin=ORIGINS[surface];if(!origin)return '';
 try{
  const href=typeof location==='string'?location:location?.href;
  if(typeof href!=='string')return origin+'/';
  const url=new URL(href);
  if(url.protocol!=='https:'||url.username||url.password||url.port||!HOSTS[surface].includes(url.hostname))return origin+'/';
  // Read only the pathname. Search, fragments, referrers and page text are never event parameters.
  const canonical=ANALYTICS_PATHS[surface].includes(url.pathname)?url.pathname:Object.hasOwn(PATH_ALIASES[surface],url.pathname)?PATH_ALIASES[surface][url.pathname]:'/';
  return origin+canonical;
 }catch{return origin+'/';}
}
export function safeReferrer(){return '';}
export function validateAnalyticsEvent(event,params={},surface='main',fallbackLanguage='es'){
 try{
  if(!Object.hasOwn(EVENT_RULES,event)||!ORIGINS[surface]||!params||typeof params!=='object'||Array.isArray(params))return null;
  const proto=Object.getPrototypeOf(params);if(proto!==Object.prototype&&proto!==null)return null;
  if(Object.getOwnPropertySymbols(params).length)return null;
  const descriptors=Object.getOwnPropertyDescriptors(params),rules=EVENT_RULES[event];
  for(const key of Object.keys(descriptors)){
   const d=descriptors[key];if(!Object.hasOwn(d,'value')||!d.enumerable)return null;
   if(key==='site_surface'){if(d.value!==surface)return null;}
   else if(key==='ui_language'){if(!language(d.value))return null;}
   else if(!Object.hasOwn(rules,key)||!rules[key].test(d.value))return null;
  }
  for(const [key,rule] of Object.entries(rules))if(rule.required&&!Object.hasOwn(descriptors,key))return null;
  const safe={site_surface:surface,ui_language:descriptors.ui_language?.value||(language(fallbackLanguage)?fallbackLanguage:'es')};
  for(const key of Object.keys(rules))if(Object.hasOwn(descriptors,key))safe[key]=descriptors[key].value;
  return safe;
 }catch{return null;}
}

/** Environment injection exists only for offline tests; no provider/API calls are performed by tests. */
export function createAnalyticsClient(environment={}){
 const getWindow=environment.getWindow||(()=>typeof window==='undefined'?null:window);
 const getDocument=environment.getDocument||(()=>typeof document==='undefined'?null:document);
 let measurementId='',surface='main',memoryConsent=null,ready=false,loading=false,generation=0,script=null,consentInitialized=false,storageListenerInstalled=false;
 const pending=[],seen=new Set(),listeners=new Set();
 const store=()=>{try{return environment.storage||getWindow()?.localStorage;}catch{return null;}};
 function consentGet(){
  if(memoryConsent)return memoryConsent;
  try{const v=JSON.parse(store()?.getItem(CONSENT_KEY)||'null');if(v?.version===1&&['granted','denied'].includes(v.state))return v.state;}catch{}
  return 'unset';
 }
 function notify(){for(const listener of listeners)try{listener(consentGet());}catch{}}
 function allowedHost(){try{const url=new URL(getWindow()?.location?.href||'');return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&HOSTS[surface].includes(url.hostname);}catch{return false;}}
 function active(){return validMeasurementId(measurementId)&&consentGet()==='granted'&&allowedHost();}
 function command(...args){
  if(environment.dispatch){environment.dispatch(...args);return;}
  const w=getWindow();if(!w)return;
  w.dataLayer=w.dataLayer||[];
  if(typeof w.gtag!=='function')w.gtag=function(){w.dataLayer.push(arguments);};
  w.gtag(...args);
 }
 function stop(){
  generation++;ready=false;loading=false;pending.length=0;
  const w=getWindow();if(w&&validMeasurementId(measurementId))w['ga-disable-'+measurementId]=true;
  if(script?.remove)script.remove();script=null;
 }
 function clearAnalyticsCookies(){
  const doc=getDocument();if(!doc)return;
  const suffix=validMeasurementId(measurementId)?measurementId.slice(2):'';
  const names=['_ga',...(suffix?['_ga_'+suffix]:[])];
  for(const name of names)for(const domain of ['', '; domain=automatizacionestorres.com','; domain=.automatizacionestorres.com']){
   try{doc.cookie=name+'=; Max-Age=0; path=/; SameSite=Lax'+domain;}catch{}
  }
 }
 function loadTag(id){
  const url='https://www.googletagmanager.com/gtag/js?id='+id;
  if(environment.loadScript)return Promise.resolve(environment.loadScript(url));
  const doc=getDocument();if(!doc?.head?.appendChild)return Promise.reject(new Error('no_document'));
  return new Promise((resolve,reject)=>{
   script=doc.createElement('script');script.async=true;script.src=url;script.dataset.torresAnalytics='true';
   script.referrerPolicy='no-referrer';
   script.onload=()=>resolve();script.onerror=()=>reject(new Error('tag_unavailable'));
   doc.head.appendChild(script);
  });
 }
 function emit(event,safe){
  if(!active()||!ready)return false;
  const payload={};
  for(const key of Object.keys(safe))payload[key]=safe[key];
  payload.page_location=safePageLocation(getWindow()?.location,surface);payload.page_referrer='';payload.page_title=TITLES[surface];payload.send_to=measurementId;
  command('event',event,payload);return true;
 }
 function currentLanguage(){const value=getDocument()?.documentElement?.lang;return value==='en'?'en':'es';}
 function ensureLoaded(){
  if(!active()||ready||loading)return;
  loading=true;const turn=++generation,id=measurementId,chosenSurface=surface;
  const w=getWindow();if(w)w['ga-disable-'+id]=false;
  try{
   // All four consent flags precede config/events. No advertising functionality is enabled.
   command('consent',consentInitialized?'update':'default',GRANTED);consentInitialized=true;
   command('set',{ads_data_redaction:true,url_passthrough:false});
   loadTag(id).then(()=>{
    if(turn!==generation||id!==measurementId||chosenSurface!==surface||!active())return;
    command('js',new Date());
    command('config',id,{
     send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,
     page_location:safePageLocation(getWindow()?.location,surface),page_referrer:'',page_title:TITLES[surface],ignore_referrer:true,
     campaign_id:'not_set',campaign_source:'direct',campaign_medium:'none',campaign_name:'not_set',campaign_term:'not_set',campaign_content:'not_set',
     linker:{accept_incoming:false,domains:[],decorate_forms:false},
    });
    ready=true;loading=false;
    // Initial consented view only. The demo explicitly records later navigations using in-memory keys.
    track('page_view');
    for(const queued of pending.splice(0))emit(queued.event,queued.safe);
   }).catch(()=>{if(turn===generation){loading=false;ready=false;pending.length=0;}});
  }catch{loading=false;ready=false;pending.length=0;}
 }
 function configureAnalytics(options={}){
  try{
   if(!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(k=>!['measurementId','surface'].includes(k)))return {configured:false,reason:'invalid_configuration'};
   const nextId=options.measurementId===undefined?DEFAULT_MEASUREMENT_ID:options.measurementId,nextSurface=options.surface||'main';
   if(!ORIGINS[nextSurface]||typeof nextId!=='string')return {configured:false,reason:'invalid_configuration'};
   if(nextId!==measurementId||nextSurface!==surface){stop();seen.clear();measurementId=nextId;surface=nextSurface;}
   if(!storageListenerInstalled&&getWindow()?.addEventListener){
    storageListenerInstalled=true;
    getWindow().addEventListener('storage',event=>{
     if(event.key!==CONSENT_KEY)return;
     let next='unset';try{const value=JSON.parse(event.newValue||'null');if(value?.version===1&&['granted','denied'].includes(value.state))next=value.state;}catch{}
     memoryConsent=next;
     if(next==='granted')ensureLoaded();
     else{const hadTag=ready||loading;stop();clearAnalyticsCookies();if(hadTag)try{command('consent','update',DENIED);}catch{}}
     notify();
    });
   }
   if(!validMeasurementId(measurementId))return {configured:false,reason:'measurement_unavailable'};
   if(!allowedHost())return {configured:false,reason:'non_public_environment'};
   ensureLoaded();return {configured:true,reason:consentGet()==='granted'?'consented':'consent_required'};
  }catch{return {configured:false,reason:'analytics_unavailable'};}
 }
 function consentSet(value){
  if(!['granted','denied'].includes(value))return false;
  memoryConsent=value;try{store()?.setItem(CONSENT_KEY,JSON.stringify({version:1,state:value}));}catch{}
  if(value==='denied'){
   const hadTag=ready||loading;stop();clearAnalyticsCookies();
   // Opt-out is set first; future track calls are no-ops. No pre-consent Google tag is loaded.
   if(hadTag)try{command('consent','update',DENIED);}catch{}
  }else ensureLoaded();
  notify();return true;
 }
 function track(event,params={},options={}){
  const safe=validateAnalyticsEvent(event,params,surface,currentLanguage());
  if(!safe)return outcome(false,false,'invalid_event_or_parameters');
  if(!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(k=>k!=='dedupeKey'))return outcome(false,false,'invalid_options');
  const key=options.dedupeKey;
  if(key!==undefined&&(typeof key!=='string'||!key||key.length>180||/[\r\n\x00-\x1f]/.test(key)))return outcome(false,false,'invalid_options');
  if(!validMeasurementId(measurementId))return outcome(true,false,'measurement_unavailable');
  if(consentGet()!=='granted')return outcome(true,false,'consent_required');
  if(!allowedHost())return outcome(true,false,'non_public_environment');
  // Do not replay earlier routes or duplicate the initial view when navigation happens during tag load.
  if(event==='page_view'&&!ready){ensureLoaded();return outcome(true,false,'loading');}
  const dedupe=event==='page_view'&&key===undefined?'page_view:'+surface+':'+safePageLocation(getWindow()?.location,surface):key===undefined?null:event+'|'+key;
  if(dedupe&&seen.has(dedupe))return outcome(true,false,'duplicate');
  if(!ready&&pending.length>=30)return outcome(true,false,'loading_queue_full');
  if(dedupe){if(seen.size>=1000)return outcome(true,false,'dedupe_limit');seen.add(dedupe);}
  if(ready){try{return outcome(true,emit(event,safe),'sent');}catch{return outcome(true,false,'transport_unavailable');}}
  pending.push({event,safe});ensureLoaded();return outcome(true,false,'loading');
 }
 return {configureAnalytics,track,consentGet,consentSet,subscribeConsent(listener){listeners.add(listener);return()=>listeners.delete(listener);}};
}

const client=createAnalyticsClient();
export const configureAnalytics=(options)=>client.configureAnalytics(options);
export const track=(event,params={},options={})=>client.track(event,params,options);
export const consentGet=()=>client.consentGet();
export const consentSet=value=>client.consentSet(value);

const CONSENT_COPY={
 es:{title:'Tu privacidad, tu decisión',body:'Con tu permiso, usamos Google Analytics y sus cookies para entender cómo se usa esta web y mejorar su navegación. No enviamos el contenido del formulario ni datos de contacto. Puedes rechazar o retirar el permiso en Privacidad.',policy:'Cómo usa Google los datos',policyUrl:'https://policies.google.com/technologies/partner-sites?hl=es',accept:'Permitir medición',reject:'No permitir',settings:'Privacidad',close:'Cerrar',region:'Preferencias de privacidad'},
 en:{title:'Your privacy, your choice',body:'With your permission, we use Google Analytics and its cookies to understand how this website is used and improve navigation. We do not send form content or contact details. You can decline or withdraw permission in Privacy.',policy:'How Google uses data',policyUrl:'https://policies.google.com/technologies/partner-sites?hl=en',accept:'Allow measurement',reject:'Do not allow',settings:'Privacy',close:'Close',region:'Privacy preferences'},
};
/** Same small, non-modal control for the React site and the static demonstration.
 * @param {{container?: HTMLElement|null,locale?: string}} options
 */
export function mountConsent({container=null,locale='es'}={}){
 if(typeof document==='undefined')return {destroy(){},setLocale(){}};
 const doc=container?.ownerDocument||document,host=container||doc.createElement('div');let lang=language(locale)?locale:'es',open=consentGet()==='unset';
 if(!container)doc.body.appendChild(host);
 const shell=doc.createElement('div');shell.className='torres-privacy';
 const style=doc.createElement('style');style.textContent='.torres-privacy{font-family:"DM Sans",Arial,sans-serif;color:#25211F}.torres-privacy button{font:inherit;cursor:pointer}.torres-privacy button:focus-visible{outline:3px solid #B69762;outline-offset:3px}.torres-privacy-panel{position:fixed;z-index:1000;right:20px;bottom:64px;width:min(460px,calc(100vw - 40px));padding:26px;background:#F4EFE5;border:1px solid #B69762;box-shadow:0 8px 32px #34131D22}.torres-privacy-panel[hidden]{display:none}.torres-privacy h2{font-family:"Instrument Serif",Georgia,serif;font-weight:400;font-size:30px;line-height:1.15;color:#511D2B;margin:0 0 12px}.torres-privacy p{font-size:14px;line-height:1.6;margin:0 0 20px}.torres-privacy-actions{display:flex;gap:10px;flex-wrap:wrap}.torres-privacy-choice{flex:1;min-width:150px;min-height:44px;padding:10px 12px;background:#F4EFE5;color:#511D2B;border:1px solid #511D2B}.torres-privacy-choice:hover{background:#511D2B;color:#F4EFE5}.torres-privacy-settings{position:fixed;z-index:999;right:20px;bottom:16px;min-height:34px;padding:6px 14px;border:1px solid #B69762;background:#F4EFE5;color:#511D2B;font-size:12px}.torres-privacy-close{margin-top:16px;min-height:32px;border:0;border-bottom:1px solid #511D2B;background:transparent;color:#511D2B;font-size:13px;padding:2px 0}';
 const panel=doc.createElement('section');panel.className='torres-privacy-panel';panel.setAttribute('role','region');
 const title=doc.createElement('h2'),body=doc.createElement('p'),policy=doc.createElement('a'),actions=doc.createElement('div');actions.className='torres-privacy-actions';
 policy.className='torres-privacy-close';policy.target='_blank';policy.rel='noopener noreferrer';
 const accept=doc.createElement('button'),reject=doc.createElement('button'),settings=doc.createElement('button'),close=doc.createElement('button');
 for(const b of [accept,reject,settings,close])b.type='button';
 accept.className=reject.className='torres-privacy-choice';settings.className='torres-privacy-settings';close.className='torres-privacy-close';
 actions.append(accept,reject);panel.append(title,body,actions,close);shell.append(style,panel,settings);host.appendChild(shell);
 function render(){const t=CONSENT_COPY[lang];title.textContent=t.title;body.textContent=t.body+' ';policy.textContent=t.policy;policy.href=t.policyUrl;body.appendChild(policy);accept.textContent=t.accept;reject.textContent=t.reject;settings.textContent=t.settings;close.textContent=t.close;panel.setAttribute('aria-label',t.region);panel.hidden=!open;close.hidden=consentGet()==='unset';settings.setAttribute('aria-expanded',String(open));}
 accept.addEventListener('click',()=>{consentSet('granted');open=false;render();settings.focus();});reject.addEventListener('click',()=>{consentSet('denied');open=false;render();settings.focus();});settings.addEventListener('click',()=>{open=!open;render();if(open)accept.focus();});close.addEventListener('click',()=>{open=false;render();settings.focus();});
 const unsubscribe=client.subscribeConsent(()=>{if(consentGet()!=='unset')open=false;render();});render();
 return {setLocale(value){if(language(value)){lang=value;render();}},destroy(){unsubscribe();shell.remove();if(!container)host.remove();}};
}
