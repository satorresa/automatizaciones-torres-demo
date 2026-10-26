# Nueve desarrollos y seis laboratorios

La demostración es un sitio estático sin base de datos o APIs operativas. La edición utiliza antracita, vino, dorado mate, DM Sans e Instrument Serif locales. La fotografía de portada es ilustrativa; no representa al personal real.

## Vista previa local

Desde la raíz del proyecto:

~~~sh
node scripts/prepare-routes.mjs
node scripts/preview-v38.mjs 4199
~~~

La dirección es http://127.0.0.1:4199/. El comando inicia únicamente un servidor local de archivos. No publica contenido ni activa integraciones de negocio.

## Páginas y controles

Los nueve relatos ES/EN se cargan de dist/cases.json, copia del contenido saneado aprobado. Cada uno tiene contexto, construcción, cuatro pasos, una interacción local, excepción, decisión humana, resultado evidenciado y límite. El contador corresponde a historias de trabajo, no a clientes. Dos módulos comparten una plataforma y dos casos un ecosistema de pedidos.

| Ruta ES | Recorrido para comprobar |
|---|---|
| /expedientes | Corregir periodo, aceptar la versión vigente, cerrar y reabrir conservando el cierre. Abrir una revisión anterior bloquea la aceptación. |
| /revision-documental | Contrastar identidad/periodo, cambiar legibilidad y revisar. Coherencia no equivale a cumplimiento o pago actual. |
| /pedidos | Registrar un intento incierto, cambiar la respuesta simulada a Confirmada y consultar recibo. Repetir conserva una sola operación. |
| /portal-de-pedidos | Cliente pide cancelación; Operación necesita leer la revisión vigente para resolver. Retirar acceso oculta el pedido a ese cliente ficticio. |
| /tienda-y-operacion | Comprador reporta; Administración revisa y confirma; preparación permanece separada. Repetir confirmación no descuenta dos veces. |
| /transporte-y-liquidacion | Supervisión resuelve revisiones diferentes; Revisión financiera confirma después. Valores ficticios, sin pago ni utilidad reconocida. |
| /producto-financiero-operativo | Revisar anticipo y costo sin sumarlos dos veces. Su estado permanece diseño de producto. |
| /operacion-comercial | Fuente, vigencia, vía, historial y supresión separados. La aprobación no envía mensajes; un acuse no crea venta o reunión. |
| /recepcion-de-casos | Revisar, simular incertidumbre y recuperar el recibo antes de repetir. Editar antes de enviar invalida la revisión. Un intento conserva su versión. |

Las rutas inglesas están en cases.json y route-manifest.json. Se generan HTML físicos para recarga y enlace directo, con assets absolutos. /en es la portada inglesa. La navegación de idioma conserva el caso; atrás/adelante usa el historial local.

## Seis controles anteriores

models.mjs, brief.mjs y sus 38 pruebas originales se conservan. Los seis controles siguen en /laboratorio y /en/lab. Un enlace anterior como /?caso=packet&idioma=es resuelve a /laboratorio/expedientes. No hay redirecciones aportadas por el visitante. Las rutas del laboratorio conservan sus modelos y estados explícitos.

La ficha nueva se prepara localmente desde tres campos y herramientas/volumen opcionales. Editarla invalida la versión preparada. Copiar o descargar no envía el texto; no se genera una comunicación externa automática. Carga declarada no significa ahorro.

## Analítica y privacidad

El módulo de analítica admite únicamente rutas e IDs públicos del catálogo dentro de listas cerradas. Las llamadas de demo_case_select y demo_evaluate no incluyen formularios, valores monetarios, narraciones o referencias operativas. Los cambios de página internos sólo registran rutas públicas admitidas. Toda analítica necesita consentimiento y un host HTTPS público autorizado; localhost y la ausencia de consentimiento mantienen el funcionamiento sin cargar Google.

Los únicos datos solicitados por el módulo de presentación son el JSON estático local. Las simulaciones no llaman al backend principal, CRM, correo, calendario, bancos o proveedores. Descargas y fichas no se registran como envíos, leads o ventas. No se usa almacenamiento persistente para estos escenarios; restablecer afecta sólo esta sesión de muestra.

## Verificación

~~~sh
node --test tests/*.test.mjs
node scripts/validate-v38.mjs
~~~

Las pruebas comprueban funciones y contratos, no fidelidad visual. El validador contrasta HTML de rutas, assets, CSP del consentimiento y ausencia de procedencia privada. La revisión visual, consola, navegación y estados deben comprobarse en un navegador por separado. Superar estas comprobaciones offline no acredita por sí solo una revisión visual.

Las referencias humanas de diseño permanecen fuera del Site. Los previews del catálogo usan la interfaz y los datos de los modelos locales; no son capturas de sistemas corporativos. No se crean imágenes vacías para simular pruebas o productos.

## Alcance público

Los siete casos con funcionalidad desarrollada, el prototipo y la tesis de producto conservan estados diferentes en el catálogo. Los recorridos locales son reconstrucciones independientes con datos ficticios. No representan nueve clientes ni acceso a sus sistemas. No se incluyen procedencia interna, configuración del alojamiento o registros comerciales.
