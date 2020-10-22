/* eslint no-sync:off */
'use strict'

const toposort = require('toposort')
const findConfig = require('find-config')
const path = require('path')
const fs = require('fs')

/**
 * @param {string} pattern
 * @returns {Promise<string[]>}
 */
function glob(pattern) {
  const g = require('glob')
  return new Promise((resolve, reject) => {
    g(
        pattern,
        (err, files) => {
          if (err) {
            reject(err)
          } else {
            resolve(files)
          }
        }
    )
  })
}

/**
 * @type {('dependencies'|'devDependencies'|'peerDependencies'|'optionalDependencies'|'bundledDependencies')[]}
 */
const dependenciesKeys = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'bundledDependencies'
]

/**
 * @param {import('./types').Opts} opts
 * @returns {string[]}
 */
function findPackagesPatterns(opts) {
  const findOpt = {cwd: opts.cwd}
  const configPath = findConfig(
      'mrpm.json',
      findOpt
  )
  if (configPath) {
    const rootPath = path.dirname(configPath)
    /**
     * @type {import('./types').Config}
     */
    const config = require(configPath)
    if (config.packages && config.packages.length) {
      return config.packages.map((p) => path.resolve(
          rootPath,
          p
      ))
    } else {
      return [
        path.resolve(
            rootPath,
            'packages/*'
        )
      ]
    }
  }
  const pkgPath = findConfig(
      'package.json',
      {cwd: opts.cwd}
  )
  if (!pkgPath) {
    throw new Error('Could not find package.json or mrpm.json')
  }
  const rootPath = path.dirname(pkgPath)
  return [
    path.resolve(
        rootPath,
        'packages/*'
    )
  ]
}

/**
 * @param {import('./types').Opts} opts
 * @returns {Promise<import('./types').Pkgs>}
 */
module.exports = async function packages(opts) {
  const packagesPatterns = findPackagesPatterns(opts)

  const results = await Promise.all(packagesPatterns.map((ptn) => glob(ptn)))
  const files = results.reduce(
      (a, files) => [
        ...a,
        ...files
      ],
      []
  )
  const dirs = files.filter((f) => fs.existsSync(f) && fs.statSync(f).isDirectory())
  const pkgs = dirs.map(getPackageInfo)


  /**
   * @type {import('./types').Pkgs}
   */
  const r = {list: pkgs, pkgs: {}, depOrder: []}
  for (const pkg of pkgs) {
    if (pkg.name) {
      r.pkgs[pkg.name] = pkg
    }
  }
  r.depOrder = makeDepOrder(r)
  return r
}

/**
 * @param {string} dir
 * @returns {import('./types').PkgInfo}
 */
function getPackageInfo(dir) {
  const pkgPath = findConfig(
      'package.json',
      {cwd: dir}
  )

  if (!pkgPath) {
    // not a package
    // @ts-expect-error
    return {
      rootDir: dir
    }
  }

  const originalPkg = require(pkgPath)
  const pkg = Object.assign(
      {},
      originalPkg
  )
  pkg.rootDir = dir
  pkg.original = originalPkg
  return pkg
}

/**
 * @param {string} name
 * @param {import('./types').Pkgs} pkgs
 */
function getInternalDependencies(name, pkgs) {
  const pkg = pkgs.pkgs[name]
  if (pkg._internalDependencies) {
    return pkg._internalDependencies
  }

  /** @type {string[]} */
  const deps = []
  for (const depsName of dependenciesKeys) {
    const dependencies = pkg[depsName]
    for (const nm in dependencies) {
      const dep = pkgs.pkgs[nm]
      if (!dep) {
        continue
      }
      deps.push(nm)
      deps.push(...getInternalDependencies(
          nm,
          pkgs
      ))
    }
  }
  return pkg._internalDependencies = [...new Set(deps)]
}

/**
 * @param {import('./types').PkgInfo} a
 * @param {import('./types').PkgInfo} b
 * @param {import('./types').Pkgs} pkgs
 */
function compareDep(a, b, pkgs) {
  const adeps = getInternalDependencies(
      a.name,
      pkgs
  )
  const bdeps = getInternalDependencies(
      b.name,
      pkgs
  )

  if (a.name && bdeps.indexOf(a.name) > -1) {
    return -1
  }
  if (b.name && adeps.indexOf(b.name) > -1) {
    return 1
  }
  return 0
}

/**
 * @param {import('./types').Pkgs} pkgs
 */
function makeDepOrder(pkgs) {
  /**
   * @type {[string, string | undefined][]}
   */
  const graph = []
  for (const pkg of pkgs.list) {
    if (!pkg.name) {
      continue
    }
    const internalDependencies = getInternalDependencies(
        pkg.name,
        pkgs
    )
    if (internalDependencies.length === 0) {
      graph.push([
        pkg.name,
        undefined
      ])
    } else {
      for (const dep of getInternalDependencies(
          pkg.name,
          pkgs
      )) {
        graph.push([
          pkg.name,
          dep
        ])
      }
    }
  }

  const list = toposort(graph).
    filter((n) => n).
    reverse().
    map((name) => pkgs.pkgs[name])

  const order = []
  let group = [list[0]]
  order.push(group)
  for (let i = 1; i < list.length; i++) {
    const e = list[i]
    if (group.every((pre) => compareDep(
        pre,
        e,
        pkgs
    ) === 0)) {
      group.push(e)
    } else {
      group = [e]
      order.push(group)
    }
  }
  return order
}
