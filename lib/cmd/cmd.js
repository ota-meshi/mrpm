'use strict'

const packages = require('../packages')
const callNpm = require('../callNpm')

/**
 * @param {import('../types').Opts} opts
 * @param {string} command
 * @param {string[]} args
 * @returns {Promise<void>}
 */
module.exports = async function cmd(opts, command, args) {
  const pkgs = await packages(opts)
  for (const group of pkgs.depOrder) {
    await Promise.all(group.map((pkg) => npmCommand(
        pkg,
        opts,
        command,
        args
    )))
  }
}

/**
 * @param {import('../types').PkgInfo} pkg
 * @param {import('../types').Opts} opts
 * @param {string} command
 * @param {string[]} args
 */
function npmCommand(pkg, opts, command, args) {
  return callNpm(
      pkg,
      command,
      args,
      opts
  )
}