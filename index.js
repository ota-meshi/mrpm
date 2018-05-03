
'use strict'

const cmd = require('./lib/cmd/cmd')
const publish = require('./lib/cmd/publish')


module.exports = function mrpm(opts, command, args, cb) {
  if (command === 'publish') {
    publish(opts, args, cb)
  } else {
    cmd(opts, command, args, cb)
  }
}


