
'use strict'

const cmd = require('./lib/cmd/cmd')
const publish = require('./lib/cmd/publish')
const run = require('./lib/cmd/run')


module.exports = function mrpm(opts, command, args, cb) {
  if (command === 'publish') {
    return publish(opts, args, cb)
  } else if (command === 'run') {
    return run(opts, args, cb)
  } else {
    return cmd(opts, command, args, cb)
  }
}


