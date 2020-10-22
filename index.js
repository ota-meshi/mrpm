
'use strict'

const cmd = require('./lib/cmd/cmd')
const publish = require('./lib/cmd/publish')
const run = require('./lib/cmd/run')


module.exports = async function mrpm(opts, command, args, cb) {
  try {
    let r
    if (command === 'publish') {
      r = await publish(
          opts,
          args
      )
    } else if (command === 'run') {
      r = await run(
          opts,
          args
      )
    } else {
      r = await cmd(
          opts,
          command,
          args
      )
    }
    if (cb) {
      cb(null)
    }

    return r
  } catch (e) {
    if (cb) {
      cb(e)
    }
    // throw e
    return undefined
  }
}


