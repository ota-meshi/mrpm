'use strict'


const chalk = require('chalk')
const packages = require('../packages')
const callNpm = require('../callNpm')

module.exports = function publish(opts, args, cb) {
  try {
    return packages(opts, cb).
      then((pkgs) => {
        const depOrder = [...pkgs.depOrder]
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
  return callNpm(pkg, 'info', [pkg.name, 'versions', '--json'], opts).then((vers) => {
    vers = JSON.parse(vers)
    if (vers.indexOf(pkg.version) >= 0) {
      console.log(chalk.gray(`skip exists package version ${pkg.name}@${pkg.version}`))
      return Promise.resolve()
    }
    return callNpm(pkg, 'publish', args, opts)
  }, (e) => {
    const r = JSON.parse(e.result)
    if (!r.error || !r.error.code || r.error.code !== 'E404') {
      throw e
    }
    // not found package
    return callNpm(pkg, 'publish', args, opts)
  })
}