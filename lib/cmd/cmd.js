'use strict'

const packages = require('../packages')
const callNpm = require('../callNpm')

module.exports = function cmd(opts, command, args, cb) {
  try {
    return packages(opts, cb).
      then((pkgs) => {
        const depOrder = [...pkgs.depOrder]
        let queue = Promise.resolve()
        depOrder.forEach((group) => {
          queue = queue.then(() => Promise.all(group.map((pkg) => npmCommand(pkg, opts, command, args))))
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

function npmCommand(pkg, opts, command, args) {
  return callNpm(pkg, command, args, opts)
}