'use strict'

const chalk = require('chalk')
const packages = require('../packages')
const callNpm = require('../callNpm')

module.exports = function cmd(opts, args, cb) {
  try {
    return packages(opts, cb).
      then((pkgs) => {
        const depOrder = [...pkgs.depOrder]
        let queue = Promise.resolve()
        depOrder.forEach((group) => {
          queue = queue.then(() => Promise.all(group.map((pkg) => npmRun(pkg, opts, args))))
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

function npmRun(pkg, opts, args) {
  const scriptName = args[0]
  if (!pkg.scripts || !pkg.scripts[scriptName]) {
    console.log(chalk.gray(`scripts.${scriptName} not found. skip script. ${pkg.name}`))
    return Promise.resolve()
  }
  return callNpm(pkg, 'run', args, opts)
}