'use strict'

const packages = require('../packages')
const callNpm = require('../callNpm')

module.exports = function cmd(opts, command, args, cb) {
  try {
    packages(opts, cb).
      then((pkgs) => {
        const tree = [...pkgs.tree]
        let queue = Promise.resolve()
        tree.forEach((group) => {
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
  }
}

function npmCommand(pkg, opts, command, args) {
  return callNpm(pkg, command, args, opts)
}