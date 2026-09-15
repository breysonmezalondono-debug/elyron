# Fase 3.2-CERT — Certificación técnica

## Resultado

**Estado: PENDIENTE DE CERTIFICACIÓN TOTAL**

El motor fue endurecido y cuenta con pruebas unitarias de autorización contextual, workflow, scope, IDOR básico, permisos atómicos, caso sin responsable y concurrencia optimista. Sin embargo, no se declara aprobado al 100% porque todavía no se ejecutaron fixtures e2e completos y deterministas para tres instituciones aisladas.

## Cambios realizados

- Permisos funcionales de casos creados y asignados por rol.
- `CaseWorkflowService` integrado en las transiciones.
- Validación específica para resolver, cerrar, reabrir y cancelar.
- Reasignación con verificación de institución, scope, responsabilidad y vigencia.
- Derivación del scope desde ficha/grupo real del solicitante.
- Rechazo de `scopeId` de otra ficha.
- Protección básica contra IDOR en lectura de casos.
- Mensajes internos filtrados para solicitantes.
- Documentos de caso reutilizando `documentos_personales` con `caseId`.
- `reviewedById` en evidencias para conservar al revisor histórico.
- Control optimista de concurrencia en cambios de estado y reasignaciones mediante `version`.
- Auditoría contextual de operaciones permitidas y denegaciones principales.
- Workflows almacenados por categoría.

## Pruebas ejecutadas

```text
Test Suites: 5 passed
Tests:       17 passed
Passed:      17
Failed:      0
Skipped:     0
Build:       OK
Lint:        OK
```

## Escenarios comprobados

- Permiso explícito y deny-by-default.
- Actor sin `cases.create`.
- Categoría de otra institución.
- Scope distinto a la ficha del solicitante.
- IDOR básico entre aprendices.
- Transiciones válidas e inválidas.
- Workflow diferente por categoría.
- Responsable más específico.
- Responsabilidad expirada.
- Caso sin responsable activo.
- Ocultamiento de mensajes internos.
- Concurrencia protegida por versión.

## Integridad y tablas

Las entidades nuevas de casos son:

- `casos`;
- `casos_categorias`;
- `casos_mensajes`;
- `casos_historial`.

La relación documental reutiliza `documentos_personales` mediante `caseId`; no se creó un segundo almacén de archivos.

La sincronización de desarrollo agregó la columna `version` en `casos` y las columnas contextuales requeridas en evidencias/documentos. No se ejecutaron migraciones destructivas.

## Pendientes para aprobar CERT

- Fixtures e2e deterministas de SENA, colegio y universidad.
- Casos reales separados por ficha, grupo y programa.
- Pruebas cross-institution completas con tokens diferentes.
- Pruebas de modificación IDOR para `MESSAGE`, `REASSIGN`, `RESOLVE`, `CLOSE`, `REOPEN` y `CANCEL`.
- Prueba documentada de mensaje interno visible al responsable y oculto al solicitante.
- Pruebas e2e de documentos con contexto correcto e incorrecto.
- Pruebas de concurrencia ejecutadas contra MySQL real.
- Auditoría de todas las denegaciones con códigos normalizados.

## Recomendación

No iniciar aún la Fase 4. El siguiente trabajo debe ser exclusivamente crear fixtures e2e y ejecutar la matriz multiinstitucional de aislamiento. Cuando esa matriz pase contra MySQL real, se puede cerrar la Fase 3 y comenzar el frontend institucional.
