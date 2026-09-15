# Fase 3.2 — Resultado técnico

## Implementado

- Permisos atómicos de casos: `cases.assign`, `cases.reassign`, `cases.change_status`, `cases.add_message`, `cases.add_internal_message`, `cases.resolve`, `cases.close`, `cases.reopen`, `cases.cancel` y `cases.attach_document`.
- `CaseWorkflowService` para transiciones por categoría.
- Permisos específicos para resolver, cerrar, reabrir y cancelar.
- Reasignación con responsable anterior, nuevo responsable, motivo y `CaseHistory`.
- Validación de responsable activo y pertenencia institucional durante la reasignación.
- Derivación automática del `scopeId` desde la ficha/grupo del solicitante.
- Rechazo de `scopeId` manipulado desde el frontend.
- Casos sin responsable en `PENDIENTE_ASIGNACION` con razón `NO_ACTIVE_RESPONSIBLE`.
- Mensajes internos no visibles para el solicitante.
- Responsabilidad y permisos validados también dentro del servicio, no solo en guards.
- Contexto institucional y scope real en fichas, grupos, programas y evidencias.
- Historial de casos y auditoría de acciones principales.
- Categorías configurables por institución y workflows por categoría.
- Documentos de caso reutilizando `documentos_personales` mediante `caseId` y `cases.attach_document`.
- Reasignación validada contra institución, vigencia y responsabilidad del nuevo responsable.
- Permisos atómicos ampliados para acciones de casos.
- `CaseWorkflowService` integrado directamente en las transiciones.
- Cobertura negativa ampliada para institución, scope, permiso y existencia de casos.

## Archivos principales creados/modificados

- `backend/src/modules/casos/case-workflow.service.ts`
- `backend/src/modules/casos/casos.service.ts`
- `backend/src/modules/casos/casos.controller.ts`
- `backend/src/modules/casos/entities/case.entity.ts`
- `backend/src/modules/casos/entities/case-category.entity.ts`
- `backend/src/modules/casos/entities/case-message.entity.ts`
- `backend/src/modules/casos/entities/case-history.entity.ts`
- `backend/src/modules/casos/case-seed.service.ts`
- `backend/src/modules/contexto/context-seed.service.ts`
- `backend/src/modules/contexto/responsibility.service.ts`
- `backend/src/modules/contexto/authorization-context.service.ts`
- `backend/src/modules/evidencias/evidencias.service.ts`
- `backend/src/modules/evidencias/evidencia.entity.ts`

## Pruebas

Resultado actual:

```text
Test Suites: 5 passed
Tests:       17 passed
Backend build: OK
Backend lint: OK
```

Las pruebas cubren:

- Permiso explícito y deny-by-default.
- Institución incorrecta.
- Alcance de ficha.
- Responsable más específico.
- Responsabilidad expirada.
- Transiciones válidas e inválidas.
- Workflow por categoría.
- IDOR básico de consulta de caso.
- Rechazo de scope manipulado.
- Caso sin responsable activo.
- Categoría de otra institución.
- Actor sin `cases.create`.
- Lectura IDOR entre instituciones.

## Verificación funcional realizada

- El aprendiz puede crear un caso cuando tiene `cases.create`.
- El scope se deriva de su ficha y no se acepta arbitrariamente.
- El caso se crea con número legible como `ELY-2026-000001`.
- Si no existe responsable activo, el caso queda en `PENDIENTE_ASIGNACION`.
- La razón queda registrada como `NO_ACTIVE_RESPONSIBLE`.
- El solicitante puede consultar su propio caso.
- El caso se elimina después de la prueba para no contaminar los datos.

## Pendientes reales

Esta fase no debe marcarse como completa al 100% hasta añadir:

- Fixtures e2e aislados para SENA, colegio y universidad.
- Pruebas cruzadas SENA → colegio → universidad con tokens y datos separados.
- Locks o control de concurrencia para cierres y reasignaciones simultáneas.
- Auditoría explícita de todas las denegaciones (`DENY`, `SCOPE_MISMATCH`, `NO_PERMISSION`).
- Integración de casos con asistencia, bienestar y apoyo de sostenimiento en todos los flujos.
- Pantallas frontend de casos, que pertenecen a la Fase 4.

## Recomendación

Antes de construir el frontend, completar los fixtures multiinstitucionales y las pruebas e2e de aislamiento. El núcleo actual ya evita el acceso básico fuera de scope, pero la certificación completa de Fase 3.2 requiere probar SENA, colegio y universidad con datos separados en una misma ejecución.
