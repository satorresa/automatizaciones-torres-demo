export const LABS=Object.freeze([
 {id:'packet',es:'/laboratorio/expedientes',en:'/en/lab/document-review',name:{es:'Preparar un expediente',en:'Prepare a document packet'}},
 {id:'order',es:'/laboratorio/pedidos',en:'/en/lab/order-changes',name:{es:'Revisar un cambio de pedido',en:'Review an order change'}},
 {id:'stock',es:'/laboratorio/inventario',en:'/en/lab/inventory-availability',name:{es:'Reservar sin duplicar',en:'Reserve without duplication'}},
 {id:'equipment',es:'/laboratorio/equipos',en:'/en/lab/equipment-service',name:{es:'Preparar un servicio',en:'Prepare equipment service'}},
 {id:'receipt',es:'/laboratorio/conciliacion',en:'/en/lab/receipt-reconciliation',name:{es:'Revisar un abono',en:'Review a receipt'}},
 {id:'opportunity',es:'/laboratorio/seguimiento-comercial',en:'/en/lab/commercial-follow-up',name:{es:'Revisar el siguiente contacto',en:'Review the next contact'}}
]);
export const homePath=lang=>lang==='en'?'/en':'/';
export const labHome=lang=>lang==='en'?'/en/lab':'/laboratorio';
export function routeTable(cases){const routes=[{path:'/',view:'home',language:'es'},{path:'/en',view:'home',language:'en'},{path:'/laboratorio',view:'labIndex',language:'es'},{path:'/en/lab',view:'labIndex',language:'en'}];for(const c of cases)for(const language of ['es','en'])routes.push({path:c.routes[language],view:'case',language,caseId:c.id});for(const c of LABS)for(const language of ['es','en'])routes.push({path:c[language],view:'lab',language,legacyId:c.id});return routes;}
export function resolveRoute(pathname,search,cases){
 const query=new URLSearchParams(search),old=LABS.find(x=>x.id===query.get('caso'));if(old){const language=query.get('idioma')==='en'?'en':'es';return{path:old[language],view:'lab',language,legacyId:old.id,replace:true};}
 const current=cases.find(x=>x.id===query.get('caso'));if(current){const language=query.get('idioma')==='en'?'en':'es';return{path:current.routes[language],view:'case',language,caseId:current.id,replace:true};}
 if(pathname==='/'&&query.get('idioma')==='en')return{path:'/en',view:'home',language:'en',replace:true};
 const path=pathname==='/'?'/':pathname.replace(/\/+$/,'');const found=routeTable(cases).find(x=>x.path===path);return found||{view:'notFound',language:path.startsWith('/en/')?'en':'es',path};
}
export function translatedRoute(route,language,cases){if(route.view==='case')return cases.find(x=>x.id===route.caseId)?.routes[language]||homePath(language);if(route.view==='lab')return LABS.find(x=>x.id===route.legacyId)?.[language]||labHome(language);if(route.view==='labIndex')return labHome(language);return homePath(language);}
