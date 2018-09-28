'use strict'

const chalk = require('chalk')
const callNpm = require('../callNpm')
const packages = require('../packages')
const semver = require('semver')
const fs = require('fs')
const path = require('path')

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}
function readDependencyRenge(pkg, pkgName) {
  return new Promise((resolve) => {
    fs.readFile(path.resolve(
        pkg.rootDir, 'package.json'
    ), 'utf8', (err, data) => {
      if (err) { throw err }
      const pkg = JSON.parse(data)
      resolve(pkg.dependencies && pkg.dependencies[pkgName])
    })
  })
}

function watchPackageVersion(pkg, pkgName, version) {
  const timeout = Date.now() + 300000
  const checkPackageVersion = () => readDependencyRenge(pkg, pkgName).
    then((range) => {
      if (range && semver.satisfies(version, range)) {
        return undefined
      }
      if (timeout < Date.now()) {
        console.log(chalk.gray(`watch package.json#dependencies["${pkgName}"]  has timed out. "${pkgName}": "${version}"`))
        return undefined
      }

      return delay(1000).then(() => checkPackageVersion())
    })
  return checkPackageVersion()
}

module.exports = function updateOutsideDependencies(opts, pkgName, version) {
  return packages(opts, (e) => {
    throw e
  }).
    then((pkgs) => {
      const ps = pkgs.list.map((pkg) => readDependencyRenge(pkg, pkgName).
        then((range) => {
          if (range && !semver.satisfies(version, range)) {
            return callNpm(pkg, 'i', ['-S', `${pkgName}@${version}`], opts).
              then(() => watchPackageVersion(pkg, pkgName, version))
          }
          return undefined
        }))
      return Promise.all(ps)
    })
}