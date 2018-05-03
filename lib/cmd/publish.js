'use strict'


const chalk = require('chalk')
const packages = require('../packages')
const callNpm = require('../callNpm')

module.exports = function publish(opts, args, cb) {
  try {
    packages(opts, cb).
      then((pkgs) => {
        const tree = [...pkgs.tree]
        let queue = Promise.resolve()
        tree.forEach((group) => {
          console.log(`publish:${group.map((p) => p.name).join(' ')}`)
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
  }
}

function npmPublish(pkg, opts, args) {
  if (pkg.private) {
    console.log(`${chalk.green('skip private package')} ${pkg.name}`)
    return Promise.resolve()
  }
  return callNpm(pkg, 'info', [pkg.name, 'versions', '--json'], opts, {log: false}).then((vers) => {
    vers = JSON.parse(vers)
    // console.log(vers);
    if (vers.indexOf(pkg.version) >= 0) {
      console.log(`${chalk.green('skip exists package version')} ${pkg.name}@${pkg.version}`)
      return Promise.resolve()
    }
    return callNpm(pkg, 'publish', args, opts)
  })
}