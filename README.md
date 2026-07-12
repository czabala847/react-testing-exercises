# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

## Testing setup (Jest + Testing Library)

El proyecto usa [Jest](https://jestjs.io/) + [Babel](https://babeljs.io/) (sin `ts-jest`) para correr los tests, y [Testing Library](https://testing-library.com/) para testear componentes de React.

### 1. Jest

```bash
pnpm add --save-dev jest
```

### 2. Babel (transforma TS/TSX a JS para que Jest lo pueda ejecutar)

```bash
pnpm add --save-dev babel-jest @babel/core @babel/preset-env
```

Se creó `babel.config.js` con:

```js
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
```

> **Importante:** como `package.json` tiene `"type": "module"`, Node interpreta los `.js` como ESM y `module.exports` no funciona ahí. Por eso el archivo se renombró a **`babel.config.cjs`** — la extensión `.cjs` fuerza a que se cargue como CommonJS sin importar el `"type"` del `package.json`. Por el mismo motivo, la configuración de Jest también se creó como `jest.config.cjs` (ver más abajo) en lugar de `jest.config.js`.

### 3. Soporte de TypeScript en Babel

```bash
pnpm add --save-dev @babel/preset-typescript
```

Se agregó al array de `presets` en `babel.config.cjs`. Nota: esto solo **transpila** TS a JS (borra las anotaciones de tipos), no hace type-checking — para eso seguimos usando `tsc`/el editor por separado.

### 4. Soporte de JSX en Babel

`@babel/preset-typescript` permite *parsear* la sintaxis `.tsx`, pero no la transforma. Sin `@babel/preset-react`, Jest fallaba con un `SyntaxError` (`Unexpected token`) apenas un test usaba JSX (`<UserForm ... />`).

```bash
pnpm add --save-dev @babel/preset-react
```

Se agregó a `presets` con el runtime automático (coincide con `"jsx": "react-jsx"` de `tsconfig.app.json`, así no hace falta importar `React` en cada archivo):

```js
["@babel/preset-react", { runtime: "automatic" }]
```

`babel.config.cjs` final:

```js
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
};
```

### 5. React Testing Library

```bash
pnpm add --save-dev @testing-library/react @testing-library/dom @types/react @types/react-dom
```

### 6. Tipos de los globals de Jest (`describe`, `it`, `expect`)

Sin esto, TypeScript no reconoce los globals de Jest aunque el test corra bien en runtime (es un error de tipos, no de ejecución).

```bash
pnpm add --save-dev @types/jest
```

y se agregó `"jest"` al array `types` de `tsconfig.app.json`:

```json
"types": ["vite/client", "jest"]
```

### 7. Entorno DOM para los tests (`jsdom`)

Desde Jest 28, el `testEnvironment` por defecto es `"node"`, no `"jsdom"`. Sin esto, cualquier test que use el DOM (render de componentes) falla con errores tipo `document is not defined`.

```bash
pnpm add --save-dev jest-environment-jsdom
```

Se creó `jest.config.cjs`:

```js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
};
```

### 8. Matchers extendidos (`toBeInTheDocument`, etc.)

```bash
pnpm add --save-dev @testing-library/jest-dom
```

Se creó `src/test-setup.ts`:

```ts
import "@testing-library/jest-dom";
```

y se registró en `jest.config.cjs` vía `setupFilesAfterEnv` (ver punto 7) para que se cargue automáticamente antes de cada test, sin tener que importarlo en cada archivo. Esto habilita tanto el matcher en runtime como los tipos de `expect(...).toBeInTheDocument()`.

### Correr los tests

```bash
pnpm test
```
