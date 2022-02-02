'use strict'

// eslint-disable-next-line no-extra-parens
const chalk = /** @type {import('chalk').Chalk} */(/** @type {unknown} */(require('chalk')))
const packages = require('../packages')
const callNpm = require('../callNpm')
const runEach = require('../util/runEach')

/**
 * @param {import('../types').Opts} opts
 * @param {string[]} args
 * @returns {Promise<void>}
 */
module.exports = async function cmd(opts, args) {
  const pkgs = await packages(opts)
  for (const group of pkgs.depOrder) {
    await runEach(
        group,
        args,
        (pkg, args) => npmRun(
            pkg,
            opts,
            args
        )
    )
  }
}

/**
 * @param {import('../types').PkgInfo} pkg
 * @param {import('../types').Opts} opts
 * @param {string[]} args
 * @returns {Promise<void>}
 */
async function npmRun(pkg, opts, args) {
  const scriptName = args[0]
  if (!pkg.scripts || !pkg.scripts[scriptName]) {
    console.log(chalk.gray(`scripts.${scriptName} not found. skip script. ${pkg.name}`))
    return
  }
  await callNpm(
      pkg,
      'run',
      args,
      opts
  )
}