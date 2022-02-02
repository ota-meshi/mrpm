'use strict'

const packages = require('../packages')
const callNpm = require('../callNpm')
const runEach = require('../util/runEach')

/**
 * @param {import('../types').Opts} opts
 * @param {string} command
 * @param {string[]} args
 * @returns {Promise<void>}
 */
module.exports = async function cmd(opts, command, args) {
  const pkgs = await packages(opts)
  for (const group of pkgs.depOrder) {
    await runEach(
        group,
        args,
        (pkg, args) => npmCommand(
            pkg,
            opts,
            command,
            args
        )
    )
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