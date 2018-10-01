'use strict'

const npmVersions = require('../util/npmVersions')
const chalk = require('chalk')

module.exports = function watchPublished(pkg) {
  const timeout = Date.now() + 300000
  const checkPublished = () => npmVersions(pkg, pkg.name).then((vers) => {
    if (vers.indexOf(pkg.version) >= 0) {
      return undefined
    }
    if (timeout < Date.now()) {
      console.log(chalk.gray(`watch published has timed out. ${pkg.name}@${pkg.version}`))
      return undefined
    }
    return checkPublished()
  })

  return checkPublished()
}