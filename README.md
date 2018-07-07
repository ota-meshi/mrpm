# mrpm

[![npm](https://img.shields.io/npm/l/mrpm.svg)](https://www.npmjs.com/package/mrpm)
[![npm](https://img.shields.io/npm/v/mrpm.svg)](https://www.npmjs.com/package/mrpm)
[![npm](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&prefix=&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/mrpm&maxAge=3600)](http://www.npmtrends.com/mrpm)
[![npm](https://img.shields.io/npm/dw/mrpm.svg)](http://www.npmtrends.com/mrpm)
[![npm](https://img.shields.io/npm/dm/mrpm.svg)](http://www.npmtrends.com/mrpm)
[![npm](https://img.shields.io/npm/dy/mrpm.svg)](http://www.npmtrends.com/mrpm)
[![npm](https://img.shields.io/npm/dt/mrpm.svg)](http://www.npmtrends.com/mrpm)
[![Build Status](https://travis-ci.org/ota-meshi/mrpm.svg?branch=master)](https://travis-ci.org/ota-meshi/mrpm) [![Greenkeeper badge](https://badges.greenkeeper.io/ota-meshi/mrpm.svg)](https://greenkeeper.io/)  

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

### Example of dir & package.json

```
pkgroot
+--packages
|  +--subpkg1
|  |  `--package.json
|  `--subpkg2
|     `--package.json
`--package.json
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

### Example of commands

* `npm install` for each monorepo projects.

```bash
mrpm install
```

* `npm update` for each monorepo projects.

```bash
mrpm update
```

* `npm publish` for each monorepo projects.

```bash
mrpm publish
```

* `npm run` script for each monorepo projects.

```bash
mrpm run xxx
```

* `npm prune` for each monorepo projects.

```bash
mrpm prune
```

## Example of Deploy with [Travis CI](https://travis-ci.org/).

### files

* `package.json`
* `.travis.yml`
* `deploy.sh`

### package.json

```json5
{
  //...
  "private": true,
  //...
  "scripts": {
    //...
    "publish:all": "mrpm publish",
    //...
  },
  "devDependencies": {
    "mrpm": "x.x.x"
  }
}
```

### .travis.yml

```yml
language: node_js
node_js:
  - "node"

deploy:
  provider: script
  script: sh $TRAVIS_BUILD_DIR/deploy.sh
```

### deploy.sh

```sh
#!/usr/bin/env bash

npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN
npm run publish:all
```

