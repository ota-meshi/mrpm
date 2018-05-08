# mrpm

MonoRepo Package Manager.  
This is the CLI tool that runs the npm command for each monorepo projects.

Inspired by [mariuslundgard/monorepo](https://github.com/mariuslundgard/monorepo).

## Why?

It was created to execute a simple npm command in order of dependencies.

## Usage
### install

```bash
npm i -D mrpm
```

### dir & package.json example

```
pkgroot
|
+--packages
|  |
|  +--subpkg1
|  |  |
|  |  +--package.json
|  |
|  +--subpkg2
|  |  |
|  |  +--package.json
|
+--package.json
```

`pkgroot/package.json`

```json5
{
  //...
  "private": true,
  //...
  "scripts": {
    "test": "mrpm run test",
    "build": "mrpm run build",
    //...
  },
  //...
}
```

`pkgroot/packages/subpkg1/package.json` or  
`pkgroot/packages/subpkg2/package.json` 

```json5
{
  // If `private` is set to `true`, it will be excluded from `publish`
  // "private": true,
  //...
  "scripts": {
    "test": "...",
    "build": "...",
    //...
  },
  //...
}
```

### command examples

* `npm install` for each monorepo projects.

```bash
mrpm install
```

* `npm publish` for each monorepo projects.

```bash
mrpm publish
```

* `npm run` script for each monorepo projects.

```bash
mrpm run xxx
```




