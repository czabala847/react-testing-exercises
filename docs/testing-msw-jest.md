# Testing con MSW v2 bajo Jest (ESM-only + Fetch API + API v1 vs v2)

## El problema

`HomeRoute.test.tsx` monta un servidor de mocks con `msw`/`msw/node` para
interceptar la llamada a la API de GitHub:

```tsx
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const handlers = [
  http.get("/api/repositories", (req, res, ctx) => {
    const query = req.url.searchParams.get("q");
    return HttpResponse.json({ items: [ /* ... */ ] });
  }),
];

const server = setupServer(...handlers);
```

Al correr `jest`, el test fallaba con una cadena de tres errores distintos,
cada uno con una causa raíz diferente (a diferencia del caso de
[react-router](./testing-react-router-jest.md), acá no era "un solo problema
disfrazado" sino tres problemas reales, uno detrás del otro).

## Error 1: `Cannot use import statement outside a module`

```
import { LensList } from "./lens-list.mjs";
    ^^^^^^
SyntaxError: Cannot use import statement outside a module
```

### Causa raíz

`msw` en sí se publica como CommonJS (`"type": "commonjs"` en su
`package.json`), pero varias de sus dependencias internas son **ESM puro**:

| Paquete | `"type"` |
|---|---|
| `rettime` | `module` |
| `headers-polyfill` | `module` |
| `until-async` | `module` |
| `@open-draft/deferred-promise` (v3, la que resuelve pnpm para msw 2.15) | `module` |

Igual que con `react-router`, Jest **no transforma nada dentro de
`node_modules` por defecto**, así que al hacer `require("msw")` la cadena de
imports terminaba cargando estos paquetes ESM tal cual, y Node no puede
interpretar `import`/`export` fuera de un módulo ES.

### Solución: `jest.config.cjs` → `transformIgnorePatterns`

```js
transformIgnorePatterns: [
  String.raw`/node_modules/(?!(\.pnpm|react-router|cookie-es|rettime|headers-polyfill|until-async|@open-draft))`,
],
```

Se agregaron los cuatro paquetes a la lista de excepciones (la misma técnica
documentada para react-router: negative lookahead sobre `/node_modules/`,
contemplando el layout anidado de pnpm vía `\.pnpm`).

> Esta lista **no es exhaustiva de por vida**: si en el futuro `msw` u otra
> dependencia agrega/cambia un paquete ESM-only, va a reaparecer el mismo
> error con otro nombre de paquete en el stack trace. Ver la sección
> "Alternativas" más abajo para una solución de raíz.

## Error 2: `ReferenceError: Request is not defined`

Con el error 1 resuelto, apareció este:

```
ReferenceError: Request is not defined
  at .../@mswjs/interceptors/src/utils/fetchUtils.ts:11:35
```

### Causa raíz

`msw` intercepta requests a nivel de red usando las clases nativas de la
**Fetch API** (`Request`, `Response`, `Headers`, etc.). El
`testEnvironment: "jsdom"` de Jest simula un navegador, pero la implementación
de jsdom que usa Jest **no expone estas clases** en su `window` simulado (a
diferencia de un navegador real o de Node 18+ corriendo sin jsdom).

### Solución: `jest-fixed-jsdom`

Confirmado en la documentación oficial de MSW
(`https://mswjs.io/docs/faq`, sección *"Request/Response/TextEncoder is not
defined (Jest)"*): la recomendación es reemplazar `jsdom` por
`jest-fixed-jsdom`, un superset que sí conserva los globals nativos de Node
(incluida la Fetch API).

```bash
pnpm add -D jest-fixed-jsdom
```

```js
// jest.config.cjs
testEnvironment: "jest-fixed-jsdom",
```

## Error 3 (silencioso): handler con la firma de MSW v1

Con los dos errores anteriores resueltos, el test **pasaba**, pero la consola
mostraba:

```
console.error
    TypeError: Cannot read properties of undefined (reading 'searchParams')
        at .../HomeRoute.test.tsx:9:27
```

### Causa raíz

El handler estaba escrito con la firma de **MSW v1**:

```ts
http.get("/api/repositories", (req, res, ctx) => {
  const query = req.url.searchParams.get("q");
  //            ^^^^^^^ req.url no existe como objeto en v2
```

En **MSW v2** (instalada en este proyecto, `^2.15.0`) el resolver recibe un
único objeto `{ request, params, cookies }`, y `request` es un objeto
`Request` real de la Fetch API — su propiedad `.url` es un **string**, no un
objeto con `.searchParams`. Hay que envolverlo en `new URL(...)` para poder
leer los query params.

Este bug no rompía el test porque las aserciones del `it(...)` estaban
comentadas (TODO sin implementar) — el error solo ensuciaba la consola. Al
implementar las aserciones reales, hubiera fallado.

### Solución

```ts
http.get("/api/repositories", ({ request }) => {
  const query = new URL(request.url).searchParams.get("q");
  // ...
});
```

## Resultado

```
Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

Sin errores ni warnings en consola.

## Alternativas consideradas (no aplicadas)

- **Vaciar `transformIgnorePatterns` por completo** (`[]`) para que Jest
  transforme *todo* `node_modules`, en vez de listar paquete por paquete cada
  vez que aparece uno nuevo ESM-only. Es más robusto a futuro (nuevas
  dependencias ESM de `msw` u otras libs no rompen nada), a costa de que los
  tests corren un poco más lento porque Babel procesa más archivos.
- **Migrar de Jest a Vitest**: la propia documentación de MSW sugiere Vitest
  como alternativa para evitar este tipo de fricción por completo — al ya
  usar Vite como build tool en este proyecto, Vitest reutiliza el mismo motor
  y entiende ESM nativamente, sin necesidad de `transformIgnorePatterns` ni
  de `jest-fixed-jsdom`. Es el cambio más "de raíz" (ver también la nota en
  [testing-react-router-jest.md](./testing-react-router-jest.md)), pero
  implica migrar sintaxis de mocks (`jest.mock` → `vi.mock`, etc.) y no era
  necesario para desbloquear este test puntual.
