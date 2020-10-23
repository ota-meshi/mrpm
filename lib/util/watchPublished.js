'use strict'

// eslint-disable-next-line no-extra-parens
const chalk = /** @type {import('chalk').Chalk} */(/** @type {unknown} */(require('chalk')))
const npmVersions = require('../util/npmVersions')
const delay = require('./delay')

/**
 * @param {import('../types').PkgInfo} pkg
 */
module.exports = async function watchPublished(pkg) {
  const timeout = Date.now() + 300000

  let times = 0
  console.log(chalk.gray(`watches published package ${pkg.name}@${pkg.version}`))
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const vers = await npmVersions(
        pkg,
        pkg.name
    )
    if (vers.indexOf(pkg.version) >= 0) {
      if (times) { process.stdout.write('\n') }
      console.log(chalk.gray(`${pkg.name}@${pkg.version} was published!`))
      return
    }
    if (timeout < Date.now()) {
      if (times) { process.stdout.write('\n') }
      console.log(chalk.gray(`watch has timed out. ${pkg.name}@${pkg.version}`))
      return
    }
    times++
    process.stdout.write('.')
    await delay(1000)
  }
}