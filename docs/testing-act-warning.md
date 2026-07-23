# El warning "not wrapped in act(...)" y por qué `findByRole`/`waitFor` lo resuelven

## El problema

Al testear `RepositoriesListItem` (que renderiza `FileIcon`), la consola mostraba:

```
console.error
    An update to FileIcon inside a test was not wrapped in act(...).

    When testing, code that causes React state updates should be wrapped into act(...):

    act(() => {
      /* fire events that update state */
    });
    /* assert on the output */
```

Apuntando a este `useEffect` en [`FileIcon.tsx`](../src/02-codesplain-starter/tree/FileIcon.tsx):

```tsx
useEffect(() => {
  icons
    .getClass(name)
    .then((k) => setKlass(k))
    .catch(() => null);
}, [name]);
```

## Causa raíz

`render()` de React Testing Library envuelve el render inicial en un `act()`
automáticamente. El `useEffect` se ejecuta dentro de ese `act()`, pero como
`icons.getClass(name)` devuelve una **promesa**, el `.then(() => setKlass(k))`
se ejecuta en un microtask **posterior**, cuando ese `act()` inicial ya cerró
y devolvió el control al test.

Es en ese momento — fuera de cualquier `act()` activo — cuando React detecta
la llamada a `setKlass` y no puede garantizar que el DOM ya refleje esa
actualización antes de que sigan las aserciones del test. De ahí el warning.

No es un problema de "Jest es síncrono y React necesita un delay": es un
problema de **scope de `act()`**. La actualización de estado ocurre en un
instante en el que no hay ningún `act()` "abierto" que la contenga.

## Qué es realmente `act()`

`act()` no es una ventana de tiempo ni un delay artificial para que el
estado "se ponga al día". Lo que hace es **vaciar (flush) sincrónicamente
todas las actualizaciones y efectos pendientes** antes de devolver el
control, de modo que el código que se ejecuta después de `act()` vea el DOM
ya actualizado. Garantiza que no queden actualizaciones de estado "colgando"
sin aplicar al momento de hacer las aserciones.

## La solución: `await screen.findByRole(...)`

```tsx
it("shows a link to the github homepage of the repository", async () => {
  renderComponent();

  await screen.findByRole("img", { name: "TypeScript" });
});
```

`findByRole` (y `waitFor` en general) no "pausan unos milisegundos a ciegas".
Internamente hacen **polling**: consultan el DOM, y si no encuentran lo
esperado, reintentan en el siguiente tick. Cada uno de esos reintentos está
envuelto en un `act()` asíncrono manejado por RTL. Por eso, cuando la
promesa de `icons.getClass` se resuelve entre un intento y otro, el
`setKlass` queda "atrapado" dentro de ese `act()` interno de RTL, y ya no
hay warning.

La ventaja frente a envolver algo manualmente en `act()` es que estas
utilidades **se adaptan automáticamente** a cuánto tarde la promesa en
resolverse, en vez de que el test tenga que adivinar el timing exacto.

## Por qué no envolver manualmente en `act()` (aunque el warning lo sugiera)

Para envolver bien la promesa a mano habría que saber exactamente cuándo se
resuelve:

```tsx
await act(async () => {
  await icons.getClass(name); // acoplado a un detalle interno del componente
});
```

Esto acopla el test a la implementación interna del componente. Si mañana
`FileIcon` agrega otro paso asíncrono (por ejemplo, una segunda promesa
encadenada), ese `act()` manual deja de ser suficiente y el warning vuelve.
En cambio, `findByRole`/`waitFor` siguen funcionando sin cambios porque no
dependen de conocer cuántos pasos asíncronos hay — solo esperan hasta que
la condición buscada (el elemento con ese role/name) aparezca en el DOM.

## Resumen

| Concepto | Explicación correcta |
|---|---|
| ¿Por qué aparece el warning? | El `setState` de una promesa resuelta ocurre fuera de cualquier `act()` activo. |
| ¿Qué hace `act()`? | Vacía (flush) las actualizaciones/efectos pendientes antes de devolver el control — no es un delay. |
| ¿Por qué usar `findByRole`/`waitFor` en vez de `act()` manual? | Porque hacen polling con `act()` interno automático, sin acoplarse al timing exacto de la implementación. |
