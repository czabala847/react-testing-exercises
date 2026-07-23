# Testing de componentes con react-router bajo Jest (v8, ESM-only)

## El problema

Un componente (`RepositoriesListItem`) usa `<Link>` de `react-router` y su test lo
envuelve en `<MemoryRouter>`, como recomienda la documentación oficial:

```tsx
import { MemoryRouter } from "react-router";

render(
  <MemoryRouter>
    <RepositoriesListItem repository={repository} />
  </MemoryRouter>,
);
```

Al correr `jest`, el test fallaba con una cadena de errores distintos, uno detrás
de otro, todos originados por la **misma causa raíz**.

## Causa raíz

En versiones anteriores (las del curso, con Create React App), `react-router-dom`
se publicaba como paquete dual: traía un build CommonJS listo para `require()`.
Jest podía cargarlo sin ningún ajuste.

Desde **react-router v7/v8** (el paquete unificado que reemplazó a
`react-router-dom`), se publica como **ESM puro** (`"type": "module"`, sin build
CJS) y además usa `import.meta.hot` internamente (una bandera propia de Vite para
detectar Hot Module Replacement). Jest, por su arquitectura, ejecuta todo sobre
CommonJS — de ahí el choque.

Esto **no es un error de uso**: `MemoryRouter` importado desde `"react-router"`
es la forma correcta y actual de testear este tipo de componente (confirmado
en la documentación oficial de react-router). El problema es 100% de
configuración de Jest para poder consumir un paquete ESM-only, no de la API.

> Nota: Jest tiene un modo experimental de ESM nativo, pero lleva años sin
> madurar y rompe otras piezas (mocking, etc.). El ecosistema Vite en general
> ya recomienda **Vitest** en vez de Jest para este tipo de proyecto, justamente
> porque reutiliza el mismo motor de Vite y no sufre este tipo de fricción. Los
> parches de este documento son válidos, pero si el proyecto crece, vale la
> pena evaluar esa migración.

## Los errores, en el orden en que aparecieron

1. `Cannot use import statement outside a module` (en `react-router/dist/production/index.js`)
2. El mismo error pero en `cookie-es` (dependencia interna de react-router)
3. `Cannot use 'import.meta' outside a module`
4. `ReferenceError: TextEncoder is not defined`
5. `SyntaxError: Unexpected token 'export'` (en `@exuanbo/file-icons-js/.../file-icons.css`, ya sin relación con react-router)
6. Errores de TypeScript en `test-setup.ts` (`Cannot find name 'global'`, `node:util`)

## Solución, pieza por pieza

### 1. `jest.config.cjs` → `transformIgnorePatterns`

```js
transformIgnorePatterns: [
  String.raw`/node_modules/(?!(\.pnpm|react-router|cookie-es))`,
],
```

Por defecto Jest **no transforma nada dentro de `node_modules`** (asume que ya
viene compilado a CommonJS). Como `react-router` es ESM puro, hay que decirle
explícitamente que sí lo transforme con Babel antes de ejecutarlo.

- `cookie-es` se agregó porque es una dependencia interna de `react-router`
  (usada para cookies de sesión) que se carga en la misma cadena de imports y
  **también** es ESM puro — sin agregarla, el error simplemente se movía ahí.
- `.pnpm` se agregó porque este proyecto usa **pnpm**, cuyo layout de
  `node_modules` mete un directorio `.pnpm` extra en la ruta real
  (`node_modules/.pnpm/react-router@8.2.0.../node_modules/react-router/...`).
  Jest trae por defecto una regla para ese layout, pero al sobreescribir
  `transformIgnorePatterns` con un arreglo propio, esa regla por defecto se
  pierde y hay que volver a contemplarla. Con npm/yarn (sin `.pnpm` en la ruta)
  el patrón sigue funcionando igual — esa parte simplemente no haría match
  nunca, sin estorbar.

### 2. `jest.config.cjs` → `transform`

```js
transform: {
  "^.+\\.[cm]?[jt]sx?$": "babel-jest",
},
```

`transformIgnorePatterns` responde "¿a qué archivos SÍ dejo pasar?", pero no
dice con qué herramienta procesarlos. El `transform` por defecto de Jest solo
cubre `.js/.jsx/.ts/.tsx` (regex `[jt]sx?`), y **no** `.mjs`. El archivo
`index.js` de `react-router` ya quedaba cubierto por el default, pero
`cookie-es` se distribuye como `dist/index.mjs`, así que hubo que extender el
regex para incluir `.mjs`/`.cjs`.

### 3. `jest.config.cjs` → `moduleNameMapper`

```js
moduleNameMapper: {
  "\\.css$": "<rootDir>/src/test-mocks/styleMock.js",
},
```

Esto **no tiene relación con react-router**. `RepositoriesListItem` renderiza
`FileIcon`, y ese componente importa un `.css` directamente
(`@exuanbo/file-icons-js/dist/css/file-icons.css`). Vite sabe manejar imports
de CSS, pero Jest corre en Node puro y no tiene ni idea de qué hacer con
`@font-face { ... }`. `moduleNameMapper` redirige ese import a un mock vacío
(`src/test-mocks/styleMock.js`, que exporta `{}`) para que Jest ni lo intente
parsear.

> Dato aparte: con Create React App esto nunca aparecía porque `react-scripts`
> traía un preset de Jest con este tipo de mocks ya configurados de fábrica.
> Al usar Jest a mano sobre un proyecto Vite, hay que recrear esos defaults uno
> por uno.

### 4. `babel.config.cjs` → plugin de `import.meta`

```js
plugins: [
  function stubImportMeta({ types: t }) {
    return {
      visitor: {
        MetaProperty(path) {
          path.replaceWith(t.objectExpression([]));
        },
      },
    };
  },
],
```

`import.meta` no es un `import`/`export` — es una "meta property" del spec de
JS (como `new.target`), y el plugin de Babel que convierte ESM a CommonJS no
la toca. El código de salida seguía teniendo `import.meta.hot` literal, y esa
sintaxis solo es válida dentro de un módulo ES real; en CommonJS, V8 ni
siquiera deja compilar el script (`Cannot use 'import.meta' outside a
module`).

Se probó primero el paquete público `babel-plugin-transform-import-meta`, pero
solo reconoce casos puntuales (`.url`, `.dirname`, `.filename`, `.resolve()`)
pensados para Node — no `.hot`, que es una convención propia de Vite para
detectar Hot Module Replacement. Por eso no servía.

La solución fue un plugin de Babel mínimo y genérico: recorre el AST buscando
nodos `MetaProperty` (la expresión completa `import.meta`, sin importar qué
propiedad le siga) y los reemplaza por un objeto vacío `{}`. Así
`import.meta.hot` se convierte en `({}).hot` → `undefined`, sin romper nada.
En Jest esa bandera nunca es verdadera de todas formas, así que el
comportamiento no cambia.

### 5. `src/test-setup.ts` → polyfill de `TextEncoder`/`TextDecoder`

```ts
/// <reference types="node" />
import { TextDecoder, TextEncoder } from "node:util";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}
```

Al importar `MemoryRouter`, se carga también el código de "server-runtime" de
react-router (firmado de cookies), que usa `new TextEncoder()` al nivel
superior del módulo. El `testEnvironment: "jsdom"` de Jest simula un
navegador, pero jsdom **no expone `TextEncoder`/`TextDecoder`** en su `window`
simulado (a diferencia de un navegador real). El polyfill toma las
implementaciones reales desde `node:util` (built-in de Node) y las cuelga en
`global` antes de que corra cualquier test (`setupFilesAfterEnv` en
`jest.config.cjs` apunta a este archivo).

- El `if (typeof ... === "undefined")` es una guarda defensiva: evita pisar una
  implementación nativa si el entorno ya la trae.
- La `/// <reference types="node" />` es aparte, un fix de TypeScript: el
  `tsconfig.app.json` del proyecto define `"types": ["vite/client", "jest"]`
  explícitamente, lo que hace que TS **ignore** cualquier otro paquete de tipos
  instalado (incluido `@types/node`), aunque esté en `node_modules`. Sin esa
  referencia, TS no reconocía `global` ni el módulo `"node:util"`. Se optó por
  una referencia local en este archivo (en vez de agregar `"node"` al `types`
  global de `tsconfig.app.json`) para no arriesgar colisiones de tipos entre
  Node y DOM en el resto de `src/` (por ejemplo, `setTimeout` devuelve tipos
  distintos en cada entorno).

## Resultado

Con estos cinco cambios, el test original (con `MemoryRouter` tal cual estaba
escrito) pasa sin modificar ni una línea de la lógica del componente ni del
test — todo el trabajo fue de configuración de Jest/Babel/TypeScript para que
pudieran convivir con un paquete ESM-only.

```
Test Suites: 5 passed, 5 total
Tests:       8 passed, 8 total
```

## Alternativas consideradas (no aplicadas)

- **Mockear `react-router` solo en este test** (`jest.mock`): evita tocar
  config global, pero deja de probar la integración real con la librería.
- **Migrar de Jest a Vitest**: al ya usar Vite, Vitest reutiliza el mismo
  motor (esbuild/Rollup) y entiende ESM/`import.meta`/CSS de forma nativa, sin
  necesidad de ninguno de estos parches. Es el cambio más "de raíz", pero
  implica migrar sintaxis (`jest.mock` → `vi.mock`, etc.) y no era necesario
  para desbloquear este test puntual.
