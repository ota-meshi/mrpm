'use strict'


const chalk = require('chalk')
const packages = require('../packages')
const callNpm = require('../callNpm')
const npmVersions = require('../util/npmVersions')
const updateOutsideDependencies = require('../util/updateOutsideDependencies')


module.exports = function publish(opts, args, cb) {
  try {
    return packages(opts, cb).
      then((pkgs) => {
        const depOrder = pkgs.depOrder.splice(0)
        let queue = Promise.resolve()
        depOrder.forEach((group) => {
          console.log(chalk.gray(`publish group:${group.map((p) => p.name).join(' ')}`))
          queue = queue.then(() => Promise.all(group.map((pkg) => npmPublish(pkg, opts, args))))
        })
        return queue
      }).
      then(() => {
        cb(null)
      }).
      catch(cb)
  } catch (err) {
    cb(err)
    return Promise.reject(err)
  }
}

function npmPublish(pkg, opts, args) {
  if (pkg.private) {
    console.log(chalk.gray(`skip private package ${pkg.name}`))
    return Promise.resolve()
  }
  return npmVersions(pkg, pkg.name).then((vers) => {
    if (vers.indexOf(pkg.version) >= 0) {
      console.log(chalk.gray(`skip exists package version ${pkg.name}@${pkg.version}`))
      return Promise.resolve()
    }
    return callNpm(pkg, 'publish', args, opts).
      then(() => watchPublished(pkg)).
      then(() => updateOutsideDependencies(opts, pkg.name, pkg.version))
  })
}

function watchPublished(pkg) {
  const timeout = Date.now() + 300000
  const checkPublished = () => npmVersions(pkg.name).then((vers) => {
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