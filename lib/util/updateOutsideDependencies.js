'use strict'

// eslint-disable-next-line no-extra-parens
const chalk = /** @type {import('chalk').Chalk} */(/** @type {unknown} */(require('chalk')))
const callNpm = require('../callNpm')
const packages = require('../packages')
const semver = require('semver')
const fs = require('fs')
const path = require('path')
const delay = require('./delay')

/**
 * @param {string} range
 */
function getMinVersion(range) {
  return new semver.Range(range).set.reduce(
      (p1, c1) => {
        const v1 = c1.reduce(
            (p2, c2) => {
              const v2 = c2.semver.version
              return p2 && semver.lte(
                  p2,
                  v2
              ) ? p2 : v2
            },
            ''
        )
        return p1 && semver.lte(
            p1,
            v1
        ) ? p1 : v1
      },
      ''
  )
}
/**
 * @param {import('../types').PkgInfo} pkg
 * @param {string} pkgName
 * @returns {Promise<string>}
 */
function readDependencyRange(pkg, pkgName) {
  return new Promise((resolve) => {
    fs.readFile(
        path.resolve(
            pkg.rootDir,
            'package.json'
        ),
        'utf8',
        (err, data) => {
          if (err) { throw err }
          /** @type {import('../types').PkgInfo} */
          const pkg = JSON.parse(data)
          resolve(pkg.dependencies && pkg.dependencies[pkgName])
        }
    )
  })
}

/**
 * @param {import('../types').PkgInfo} pkg
 * @param {string} pkgName
 * @param {string} version
 */
async function watchPackageVersion(pkg, pkgName, version) {
  const timeout = Date.now() + 300000
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const range = await readDependencyRange(
        pkg,
        pkgName
    )
    if (range && semver.satisfies(
        version,
        range
    )) {
      return
    }
    if (timeout < Date.now()) {
      console.log(chalk.gray(`watch package.json#dependencies["${pkgName}"]  has timed out. "${pkgName}": "${version}"`))
      return
    }

    await delay(1000)
  }
}

/**
 * @param {import('../types').Opts} opts
 * @param {string} pkgName
 * @param {string} version
 */
module.exports = async function updateOutsideDependencies(opts, pkgName, version) {
  const pkgs = await packages(opts)

  const ps = pkgs.list.map(async(pkg) => {
    const range = await readDependencyRange(
        pkg,
        pkgName
    )
    if (!range) {
      return
    }

    const minVersion = getMinVersion(range)
    if (!semver.satisfies(
        version,
        minVersion
    )) {
      await callNpm(
          pkg,
          'i',
          [
            '-S',
            `${pkgName}@${version}`
          ],
          opts
      )
      await watchPackageVersion(
          pkg,
          pkgName,
          version
      )
    }
  })

  return Promise.all(ps)
}