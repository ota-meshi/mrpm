'use strict'


const spawn = require('./spawn')

/**
 *
 * @param {import('./types').PkgInfo} pkg
 * @param {string} command
 * @param {string[]} params
 * @param { { quiet?: boolean, cwd?: string } } opts
 */
module.exports = async function npm(pkg, command, params, opts) {
  if (!pkg.name) { return '' } // not a package

  const v = await spawn(
      pkg.name,
      'npm',
      [command].concat(params),
      {
        cwd: pkg.rootDir,
        quiet: opts.quiet
      }
  )
  return v
}

