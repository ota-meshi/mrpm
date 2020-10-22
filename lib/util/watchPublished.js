'use strict'

// eslint-disable-next-line no-extra-parens
const chalk = /** @type {import('chalk').Chalk} */(/** @type {unknown} */(require('chalk')))
const npmVersions = require('../util/npmVersions')

/**
 * @param {import('../types').PkgInfo} pkg
 */
module.exports = async function watchPublished(pkg) {
  const timeout = Date.now() + 300000

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const vers = await npmVersions(
        pkg,
        pkg.name
    )
    if (vers.indexOf(pkg.version) >= 0) {
      return
    }
    if (timeout < Date.now()) {
      console.log(chalk.gray(`watch published has timed out. ${pkg.name}@${pkg.version}`))
      return
    }
  }
}