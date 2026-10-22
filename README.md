EAUD-0031 añade enlaces por caso y una ficha local para empresas y agencias. La información permanece en el navegador hasta que el visitante decide compartirla. La carga de trabajo declarada no se presenta como ahorro. Consulta [Del ejemplo a una conversación concreta](docs/FIRST_WORKFLOW.md) para operación, límites y comprobaciones.

# Automatizaciones Torres · demostraciones

[Abrir demostración interactiva en español e inglés](https://torres-demostraciones.tunedrice6.chatgpt.site)

Seis modelos funcionales para explorar decisiones de un proceso con casos completamente ficticios. El visitante puede cambiar entradas, observar diferencias y entender qué necesita la revisión de una persona. Son demostraciones construidas para este portfolio, no implantaciones de clientes ni resultados comerciales acreditados.

El sitio trabaja con reglas deterministas en el navegador. No contiene un modelo de IA externo, backend de operación, autenticación productiva, conexión bancaria o transporte de correo. Una acción simulada no reserva existencias, confirma dinero ni contacta personas en sistemas reales.

## Recorridos

| Demostración | Decisión visible |
|---|---|
| Revisión documental | Periodo correcto, soporte presente y aprobación expresa antes de dar el expediente por preparado. |
| Cambio de pedido | Diferencias de cantidad y acabado con autorización de la versión que irá a producción. |
| Reserva de unidades | Existencias conocidas, compromisos, saldo e identificación de una reserva ya registrada. |
| Preparación de servicio | Identificación del equipo, autorización y documento que permite preparar la atención. |
| Revisión de un abono | Correspondencia de importe y referencia con revisión humana, sin reconocer ingresos reales. |
| Contexto comercial | Fuente, buzón e historial separados de aprobación, acuse y reunión. |

La API de [dist/models.mjs](dist/models.mjs) es independiente de la presentación. [Contrato y límites](docs/DEMONSTRATION.md) explica cada resultado y sus claves de traducción. No se incluyen datos, documentos o conexiones de otra operación.

## Comprobar

Requiere una versión moderna de Node.js con el ejecutor de pruebas integrado. No necesita instalar dependencias para estos modelos.

```powershell
node --test tests/models.test.mjs
```

Las pruebas cubren entradas inválidas, diferencias pendientes, aprobación expresa, reservas repetidas, dinero solo reportado, supresión e historial. Una respuesta o una reunión nunca se convierten en venta. Estas pruebas no certifican una integración ni sustituyen la revisión de la interfaz publicada.

La carpeta `dist` se sirve como sitio estático, sin un servidor de negocio. Para una revisión local, si Python está disponible:

```powershell
python -m http.server 4185 --bind 127.0.0.1 --directory dist
```

Abrir `http://127.0.0.1:4185` en el canal de navegador autorizado. El servidor solo facilita la vista previa de archivos. No habilita los servicios que la demostración representa.

## Alcance de la información

Los datos se generan para el ejemplo. Un importe o una cantidad no se presenta como cifra de un negocio real. Las reglas ilustran preparación y control de un recorrido y no emiten decisiones jurídicas, médicas, de seguridad, crédito o cumplimiento. La reserva repetida usa un indicador explícito de la simulación; una implementación real necesitaría persistencia y verificación de identidad de esa reserva en el servidor.

Cada módulo devuelve objetos de datos. La interfaz debe representar las entradas de texto con `textContent` o un escape equivalente y mantener visibles los estados pendientes. No se interpretan HTML o instrucciones proporcionados por el visitante. La auditoría de procedencia de ideas y los contextos de trabajo que motivaron estas demostraciones se mantienen fuera del repositorio público.

## English summary

Explore the [live bilingual demonstration](https://torres-demostraciones.tunedrice6.chatgpt.site). Change fictional inputs, inspect the result and see which decision still needs a person. The six cases cover document review, order changes, stock reservations, equipment-service preparation, receipt comparison and commercial-contact checks.

These are independent demonstrations with deterministic JavaScript rules and explicit human review. They contain no customer data, external AI service, real payment recognition, messaging or production integration. They do not establish client deployments or business results. Run `node --test tests/models.test.mjs` to check the models. The [demonstration contract](docs/DEMONSTRATION.md) describes the exact result shapes and boundaries.

## Derechos

© 2026 Automatizaciones Torres. Todos los derechos reservados. El acceso público al repositorio permite consultar la demostración; no concede una licencia de reutilización, modificación o distribución del código o del diseño. Para acordar otros usos, contactar a automatizaciones.storres@gmail.com.
