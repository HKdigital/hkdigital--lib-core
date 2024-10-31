# HKdigital's lib Sveltekit

**EARLY DEVELOPMENT RELEASE**

This is a library for [SvelteKit](https://svelte.dev/) projects, that contains common code and components that we use to create our projects. 

## Using the library

### Install

The library can be installed as a normal NPM library.

```bash
pnpm add @hkdigital/lib-sveltekit
```

### Update

```bash
ncu "@hkdigital/*" -u && pnpm install
```

### Import

All exports are in subfolders. For example to import a constant from `constants/regexp/index.js`

```svelte
import { CHAR } from '@hkdigital/lib-sveltekit-test/constants/regexp';
```

## Building the showcase app

To build your library:

```bash
npm run package
```

To create a production version of your showcase app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Developing

To develop this library, clone the repository and install the dependencies, then start the development server of the test runners. Checkout the [package.json](./package.json) file for more details.

Everything inside `src/lib` is part of the library, everything inside `src/routes` is the showcase app of this library.

## Publishing

The name of this library is `@hkdigital/lib-sveltekit` and it is published on [NPM](https://npmjs.com). You need NPM credentials to publish in the scope `@hkdigital`. 

### Contribute
If your wish to contribute to this library, please contact us [HKdigital](https://hkdigital.nl/contact). Alternatively, the license permits you to fork the library and publish under an alternative name. Change the package name in [package.json](./package.json) to do so.

```bash
npm login
npm version patch
npm publish --access public
```
