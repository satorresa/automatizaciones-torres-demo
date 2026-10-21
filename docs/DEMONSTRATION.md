# Contrato de las demostraciones

Los seis exports de `dist/models.mjs` reciben objetos similares a JSON y devuelven resultados nuevos, sin modificar las entradas. No leen reloj, red, almacenamiento, cuenta, credencial o archivo del visitante. Los controles de la interfaz cambian una simulación y no sustituyen autorizaciones de un sistema productivo.

## `inspectPacket`

Entrada `{expectedPeriod, documentPeriod, hasAttachment, approved}`. Los periodos admiten `YYYY-MM` o `YYYY-Q1` a `YYYY-Q4`. La comparación es exacta entre periodos válidos y no interpreta reglas legales o la cobertura de un proveedor.

Salida `{ok, issues, stage}`. `stage` vale `ready` solo cuando ambos periodos válidos coinciden, existe el soporte y `approved` es el booleano `true`. En otro caso es `review`.

Claves de `issues`: `expected_period_invalid`, `document_period_invalid`, `attachment_missing`, `period_mismatch`, `approval_required`.

Un ejemplo puede usar un expediente esperado para `2027-Q2` y un documento de `2027-Q1`. La diferencia queda abierta hasta que se corrija o revise. La coincidencia documental no certifica autenticidad, cumplimiento o derecho a pago.

## `reviseOrder`

Entrada `{baseline:{units, finish}, requested:{units, finish}, approved}`. Las unidades deben ser enteros seguros positivos. El acabado es texto de una a ochenta posiciones tras quitar espacios exteriores y no admite caracteres de control.

Salida `{changes:[{field,before,after}], stage, productionAllowed}`. Los campos comparables son `units` y `finish`. La autorización corresponde a la versión solicitada que se está mostrando y requiere `approved === true`. Un cambio detectado no se considera una aprobación.

`stage` puede ser `invalid`, `review` o `ready`. Entradas inválidas devuelven cambios vacíos y `productionAllowed:false`. Aun cuando no haya diferencias, este modelo no infiere una aprobación histórica que el llamador no proporcionó.

## `reserveUnits`

Entrada `{stock, committed, requested, existingReservation=false}`. Los valores numéricos son enteros seguros, sin conversión desde cadenas. `stock` y `committed` admiten cero; `requested` debe ser positivo. Un inventario desconocido, cero confirmado y saldo insuficiente son situaciones diferentes.

Salida `{ok, availableBefore, availableAfter, reservedNow, reason}`. Las entradas inválidas o el inventario desconocido devuelven saldos `null` y ninguna reserva. Los compromisos no pueden exceder las existencias. Si la solicitud supera el saldo, este no cambia y no se produce una reserva parcial.

`existingReservation:true` significa que el llamador ya confirmó esa misma reserva y que su cantidad está incluida en `committed`. El resultado conserva el saldo y devuelve `reservedNow:0`, incluso si ya no queda saldo libre. Esta es una demostración del comportamiento repetido, no un registro persistente o prueba de identidad de una reserva real.

Claves de `reason`: `stock_unknown`, `stock_invalid`, `committed_invalid`, `requested_invalid`, `reservation_flag_invalid`, `commitment_exceeds_stock`, `already_reserved`, `insufficient_units`, `reserved`.

## `inspectEquipment`

Entrada `{tagged, authorized, attachment}`. Los tres controles requieren booleano `true`.

Salida `{ok, missing, stage}`. `stage` es `ready` únicamente si están presentes la identificación, autorización del trabajo y soporte. En otro caso es `review`. Las claves de `missing` son `equipment_identity_missing`, `work_authorization_missing` y `service_attachment_missing`.

Este resultado prepara la atención. No diagnostica el equipo, decide seguridad o certifica que se ejecutó una intervención.

## `reconcileReceipt`

Entrada `{expected, received, referenceMatches, reviewed}`. Los importes ficticios se representan en unidades enteras seguras. El esperado debe ser positivo y el recibido no negativo. Cadenas, fracciones, infinitos y NaN se rechazan.

Salida `{ok, difference, stage, recognizedIncome:0}`. `difference` es **recibido menos esperado**; es `null` si los importes son inválidos. Una diferencia positiva o negativa requiere revisión. Un importe exacto tampoco basta sin `referenceMatches === true` y `reviewed === true`.

`stage` vale `invalid`, `review` o `ready`. Incluso con `ok:true`, `recognizedIncome` siempre es cero. El resultado solo expresa consistencia de datos ficticios y no demuestra un abono, ingreso, rentabilidad o confirmación bancaria.

## `qualifyOpportunity`

Entrada `{sourceVerified, mailboxVerified, priorContact, suppressed, humanApproved, acknowledged, meetingConfirmed}`. Los controles son booleanos. Los no proporcionados se interpretan como no confirmados; otros tipos generan `invalid_flags`.

Salida `{allowed, stage, reasons}`. `allowed:true` requiere fuente y buzón confirmados, aprobación humana y ausencia de supresión e historial. Un acuse o una reunión también cuentan como historial y exigen revisar la conversación antes de otro primer acercamiento. El resultado nunca envía un mensaje ni comprueba realmente un buzón.

Prioridad de `stage`: `blocked` por supresión, `invalid` por tipos incorrectos y, entre los estados restantes, `meeting`, `acknowledged`, `history_review`, `review` o `ready`. No existe un estado `won` ni una conversión automática a contrato. El acuse de recepción conserva su significado de acuse.

Claves de `reasons`: `invalid_flags`, `suppressed`, `history_requires_review`, `source_unverified`, `mailbox_unverified`, `human_approval_required`.

## Presentación y prueba

La interfaz debe explicar que las marcas de verificación son datos del ejemplo, no resultados de un proveedor en vivo. Debe mostrar los motivos y la revisión pendiente, permitir modificar las entradas y volver a calcular sin conservar como vigente un resultado anterior. Los textos y exportaciones de ejemplo mantienen su identificación como ficticios.

`node --test tests/models.test.mjs` comprueba los casos normales, inconsistencias, valores inválidos, repetición de reserva, rechazo de tipos engañosos e historial que no acredita una venta. La prueba de modelos es distinta de la prueba visual o de accesibilidad de la interfaz.

El sitio no incorpora copias de sistemas internos, logos de terceros, capturas de clientes, archivos originales, números de cuenta o credenciales. Cualquier conexión futura necesita un alcance propio y una implementación real, con sus pruebas y responsabilidades explícitas.
