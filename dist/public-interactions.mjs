import { track } from './analytics.mjs';

/** Public, fixed UI labels only. No form values, destination URLs or identifiers enter analytics.
 * @param {{surface:'main'|'demo',getLanguage:()=>string,document?:Document}} options
 */
export function mountPublicInteractions({surface,getLanguage,document:doc=document}) {
  const language=()=>getLanguage()==='en'?'en':'es';
  const selectors=surface==='main'
    ? [['#inicio','home'],['#recorrido','approach'],['#case-intake','intake'],['#preguntas','faq'],['.site-footer','contact']]
    : [['.hero','home'],['#laboratorio','lab'],['#brief-builder','brief'],['#criterio','approach'],['#colaborar','collaborate']];
  const sections=selectors.map(([selector,id])=>({element:doc.querySelector(selector),id})).filter(x=>x.element);
  function measureVisible(){
    const height=doc.defaultView?.innerHeight||0;
    if(!height)return;
    for(const {element,id} of sections){
      const box=element.getBoundingClientRect();
      if(box.top<height*.8&&box.bottom>Math.min(120,height*.3))
        track('section_view',{section_id:id,ui_language:language()},{dedupeKey:surface+':section:'+id});
    }
  }
  const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(measureVisible,{threshold:[0,.15,.5]});
  sections.forEach(({element})=>observer?.observe(element));
  function click(event){
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    // Consent controls run their handler before this bubble listener. Measure only the current viewport.
    if(target.closest('.torres-privacy-choice'))measureVisible();
    const anchor=target.closest('a');if(!anchor)return;
    const href=anchor.getAttribute('href')||'';
    if(surface==='main'&&href.startsWith('https://demo.automatizacionestorres.com'))track('demo_open',{ui_language:language()});
    const channel=href.startsWith('mailto:automatizaciones.storres@gmail.com')?'email':href.startsWith('https://wa.me/573105497003')?'whatsapp':null;
    if(!channel)return;
    const placement=anchor.closest('header')?'header':anchor.closest('.site-footer,footer')?'footer':anchor.closest('#brief-builder')?'brief':anchor.closest('#colaborar')?'collaborate':anchor.closest('#inicio,.hero')?'hero':'brief';
    track('contact_intent',{channel,placement,ui_language:language()});
  }
  function focus(event){
    if(surface==='main'&&event.target instanceof Element&&event.target.closest('#case-intake form:not(.verification-form)'))
      track('intake_start',{ui_language:language()},{dedupeKey:'main:intake_start'});
  }
  function toggle(event){
    const target=event.target;if(!(target instanceof HTMLDetailsElement)||!target.open)return;
    const index=Array.from(doc.querySelectorAll('.questions-list details')).indexOf(target);
    if(index>=0&&index<4)track('faq_open',{faq_id:index+1,ui_language:language()});
  }
  doc.addEventListener('click',click);doc.addEventListener('focusin',focus);doc.addEventListener('toggle',toggle,true);
  measureVisible();
  return ()=>{observer?.disconnect();doc.removeEventListener('click',click);doc.removeEventListener('focusin',focus);doc.removeEventListener('toggle',toggle,true);};
}
