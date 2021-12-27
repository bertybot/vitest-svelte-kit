# vitest-svelte-kit

Automatically configure Vitest from your Svelte Kit configuration.

## Getting Started

### Installing

```sh
npm i -D vitest vitest-svelte-kit
```

### Configuring

Create a file called `vitest.config.js` and add the following.

```js
import { extractFromSvelteConfig } from 'vitest-svelte-kit'

export default extractFromSvelteConfig()
```

By default Vitest will use the Vite configuration present in `vite.config.js`. Since in Svelte Kit the Vite confiugration is instead a part of `svelte.config.js`, we will extract it, plus any inferred configuration, and pass that to Vitest.

To learn more about how you can configure Vitest, visit the [Configuring Vitest](https://vitest.dev/guide/#configuring-vitest) section its documentation.
