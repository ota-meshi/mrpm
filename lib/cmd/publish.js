'use strict'

// eslint-disable-next-line no-extra-parens
const chalk = /** @type {import('chalk').Chalk} */(/** @type {unknown} */(require('chalk')))
const packages = require('../packages')
const callNpm = require('../callNpm')
const npmVersions = require('../util/npmVersions')
const watchPublished = require('../util/watchPublished')

const updateOutsideDependencies = require('../util/updateOutsideDependencies')


/**
 * @param {import('../types').Opts} opts
 * @param {string[]} args
 * @returns {Promise<void>}
 */
module.exports = async function publish(opts, args) {
  const pkgs = await packages(opts)

  for (const group of pkgs.depOrder) {
    console.log(chalk.gray(`publish group:${group.map((p) => p.name).join(' ')}`))
    await Promise.all(group.map((pkg) => npmPublish(
        pkg,
        opts,
        args
    )))
  }
}

/**
 * @param {import('../types').PkgInfo} pkg
 * @param {import('../types').Opts} opts
 * @param {string[]} args
 * @returns {Promise<void>}
 */
async function npmPublish(pkg, opts, args) {
  if (pkg.private) {
    console.log(chalk.gray(`skip private package ${pkg.name}`))
    return
  }
  console.log(chalk.gray(`start check published package version ${pkg.name}@${pkg.version}`))
  const vers = await npmVersions(
      pkg,
      pkg.name
  )
  if (vers.indexOf(pkg.version) >= 0) {
    console.log(chalk.gray(`skip exists package version ${pkg.name}@${pkg.version}`))
    return
  }


  // publish!
  await callNpm(
      pkg,
      'publish',
      args,
      opts
  )
  await watchPublished(pkg)
  await updateOutsideDependencies(
      opts,
      pkg.name,
      pkg.version
  )
}
