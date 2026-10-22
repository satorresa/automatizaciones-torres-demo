# Del ejemplo a una conversación concreta

EAUD-0031 · 22 de octubre de 2026

La página conserva sus seis demostraciones y añade una ficha local de primera entrega. El visitante puede describir entrada, salida, aprobación y herramientas. Puede distinguir su empresa de un cliente de su agencia. Volumen y minutos son opcionales. Su producto representa carga actual declarada, nunca ahorro estimado, cotización o resultado de un cliente.

El enlace puede abrir un caso específico mediante `caso`, elegir `idioma=es|en` y conservar una referencia comercial genérica mediante `origen`. Los casos son `packet`, `order`, `stock`, `equipment`, `receipt` y `opportunity`. Los valores desconocidos vuelven al primer ejemplo y al español. La referencia acepta hasta cuarenta caracteres ASCII en minúsculas, dígitos, guion y guion bajo. No usar identificadores personales, correos o nombres de clientes en esa referencia.

El botón «Traer mi caso» lleva desde la demostración a la ficha. Prepararla requiere describir entrada y salida y la decisión que conserva una persona. No requiere registrarse ni entregar teléfono o correo antes de ver el resultado. Una modificación invalida el resultado anterior y retira los enlaces hasta prepararlo de nuevo. Cambiar de idioma o ejemplo también invalida la ficha, conservando los campos para que el visitante los revise.

El texto se puede descargar y revisar antes de abrir correo o WhatsApp. El destinatario comercial fijo es Jair Peinado, automatizaciones.storres@gmail.com, WhatsApp 310 549 7003. Abrir la aplicación no envía un mensaje. El visitante lo confirma en su aplicación. No se añaden comisiones, precios, plazos, pilotos gratuitos ni compromisos de confidencialidad no acordados.

Los textos permanecen en memoria del navegador. No hay almacenamiento local, cookies, analítica, píxeles, formularios de servidor o llamadas API. La política CSP mantiene `connect-src 'none'`. Los datos del formulario no entran en la URL compartible de la página. Los enlaces de WhatsApp y correo contienen únicamente el texto que el visitante revisa y decide compartir. No introducir secretos ni datos de terceros.

La referencia comercial permite reconocer el experimento si el visitante la conserva al escribir. No cuenta visitas, clics, fichas preparadas, mensajes enviados ni contactos recibidos. La recepción real sólo se registra cuando exista el mensaje o una conversación confirmada. La ausencia de métricas web no se reemplaza con cifras inventadas.

La prueba comercial inicial enlaza esta herramienta desde acercamientos individuales a socios con oferta complementaria. El historial comercial, las fuentes y los destinatarios reales permanecen en el registro privado de Automatizaciones Torres. El repositorio público conserva sólo código, documentación y ejemplos sintéticos.

## Comprobaciones

`node --test tests/models.test.mjs tests/brief.test.mjs` comprueba los modelos previos y los nuevos límites de contexto, destinatario, medición y texto. Las pruebas de navegador cubren enlaces por caso, formulario incompleto, ficha con datos ficticios, cambios que invalidan, descarga idéntica al texto revisado, idiomas y vista adaptable. La confirmación visual de copiado se conserva como tal. Una lectura vacía por el puente de portapapeles de la sesión de prueba no acredita una copia recuperable por ese puente; el campo de enlace permanece seleccionable como alternativa.

La herramienta ayuda a iniciar una conversación con contexto. Publicarla no acredita demanda, compradores, ahorro ni cierres.
