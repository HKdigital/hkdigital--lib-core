# HKdigital's lib-core

Core library that we use to power up our SvelteKit projects

This is a library for [SvelteKit](https://svelte.dev/) projects.
It contains common code and components that we use to create our projects.

## Status

**EARLY DEVELOPMENT RELEASE**
This package is incomplete and not fully tested.
Do not use in production environments yet.

### TODO

## Using the library

### Install

The library can be installed as a normal NPM library.

```bash
pnpm add @hkdigital/lib-sveltekit
```

#### Tailwind

Components in this package use [tailwindcss](https://tailwindcss.com/).

To compile tailwind classes inside this package, you must add the package location to your tailwindcss plugin configuration.

```
// tailwind.config.js
export default {
  content: [
    './node_modules/@hkdigital/**/*.{html,js,svelte,ts}',
    './src/**/*.{html,js,svelte,ts}',
```

### Update

Make sure your project has a script called `upgrade:hk` to upgrade all packages
in the '@hkdigital' namespace.

```bash
pnpm upgrade:hk
```

### The package.json scripts:

```bash
pnpm add -D npm-check-updates
pnpm add -D npm-check-updates
```

```js
"scripts": {
  "upgrade:hk": "run-s upgrade:hk:update pnpm:install",
  "upgrade:hk:update": "ncu --dep dev,optional,peer,prod '@hkdigital/*' -u",
  "pnpm:install": "pnpm install"
}
```


### Import JS, Svelte files and Typedefs

Most subfolders have an index.js that export all functionality and typedefs.

```svelte
import { CHAR } from '@hkdigital/lib-sveltekit/constants/regexp/index.js';
```

### Import CSS

Vite should include postcss-import, but the only solution to get it working for now is to use a relative path to the node_modules folder.

For example:

```css
/* src/app.css */
@import '../node_modules/@hkdigital/lib-sveltekit/dist/css/utilities.css';
```

### Enable tailwind processing

Allow the tailwind CSS processor to work on the library inside node_modules

```js
// tailwind.config.js
export default {
  content: [
    './node_modules/@hkdigital/**/*.{html,js,svelte,ts}',
    './src/**/*.{html,js,svelte,ts}',
```

## Building the library

To build your library:

```bash
npm run package
```

## Building the showcase app

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

```bash
# Manually
npm login
npm version patch
npm publish --access public
```

```bash
# Run `npm version patch && npm publish --access public && git push`
# as specified in package.json
pnpm run publish:npm
```

### Troubleshooting

#### Running scripts from package.json in Windows

The CMD terminal in Windows is quite limited. Use the PowerShell instead of some scripts from package.json do not run correctly.


## Contribute

If your wish to contribute to this library, please contact us [HKdigital](https://hkdigital.nl/contact). Alternatively, the license permits you to fork the library and publish under an alternative name. Don't forget to change the package name in [package.json](./package.json) if you do so.

