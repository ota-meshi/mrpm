'use strict'


const toposort = require('toposort')
const findConfig = require('find-config')
const path = require('path')


function glob(pattern) {
  const g = require('glob')
  return new Promise((resolve, reject) => {
    g(pattern, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })
}


const dependenciesKeys = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'bundledDependencies'
]

function findPackagesPatterns(opts, cb) {
  const findOpt = {cwd: opts.cwd}
  const configPath = findConfig('mrpm.json', findOpt)
  if (configPath) {
    const rootPath = path.dirname(configPath)
    const config = require(configPath)
    if (config.packages && config.packages.length) {
      return config.packages.map((p) => path.resolve(rootPath, p))
    } else {
      return [path.resolve(rootPath, 'packages/*')]
    }
  }
  const pkgPath = findConfig('package.json', {cwd: opts.cwd})
  if (!pkgPath) {
    const e = new Error('Could not find package.json or mrpm.json')
    cb(e)
    return Promise.reject(e)
  }
  const rootPath = path.dirname(pkgPath)
  return [path.resolve(rootPath, 'packages/*')]
}

module.exports = function packages(opts, cb) {
  const packagesPatterns = findPackagesPatterns(opts, cb)

  try {
    return Promise.all(packagesPatterns.map((ptn) => glob(ptn))).
      then((results) => results.reduce((a, files) => a.concat(files), [])).
      then((files) => files.map(getPackageInfo)).then((pkgs) => {
        const r = {list: pkgs}
        pkgs.forEach((pkg) => {
          if (pkg.name) {
            r[pkg.name] = pkg
          }
        })
        r.depOrder = makeDepOrder(r)
        return r
      })
  } catch (err) {
    cb(err)
    return Promise.reject(err)
  }
}

function getPackageInfo(dir) {
  const pkgPath = findConfig('package.json', {cwd: dir})

  if (!pkgPath) {
    // not a package
    return {
      rootDir: dir
    }
  }

  const originalPkg = require(pkgPath)
  const pkg = Object.assign({}, originalPkg)
  pkg.rootDir = dir
  pkg.original = originalPkg
  return pkg
}

function getInternalDependencies(name, pkgs) {
  const pkg = pkgs[name]
  if (pkg._internalDependencies) {
    return pkg._internalDependencies
  }

  const set = new Set()
  dependenciesKeys.forEach((depsName) => {
    const dependencies = pkg[depsName]
    for (const nm in dependencies) {
      const dep = pkgs[nm]
      if (!dep) {
        continue
      }
      set.add(nm)
      getInternalDependencies(nm, pkgs).forEach((n) => set.add(n))
    }
  })
  return pkg._internalDependencies = Array.from(set)
}

function compareDep(a, b, pkgs) {
  const adeps = getInternalDependencies(a.name, pkgs)
  const bdeps = getInternalDependencies(b.name, pkgs)

  if (bdeps.indexOf(a.name) > -1) {
    return -1
  }
  if (adeps.indexOf(b.name) > -1) {
    return 1
  }
  return 0
}

function makeDepOrder(pkgs) {
  const graph = pkgs.list.map((pkg) => pkg.name).
    map((name) => [name].concat(getInternalDependencies(name, pkgs)))

  const list = toposort(graph).filter((n) => n).reverse().map((name) => pkgs[name])

  const order = []
  let group = [list[0]]
  order.push(group)
  for (let i = 1; i < list.length; i++) {
    const e = list[i]
    if (group.every((pre) => compareDep(pre, e, pkgs) === 0)) {
      group.push(e)
    } else {
      group = [e]
      order.push(group)
    }
  }
  return order
}
