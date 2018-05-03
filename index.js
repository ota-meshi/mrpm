#!/usr/bin/env node

'use strict'

const chalk = require('chalk')
const cmd = require('./lib/cmd/cmd')
const publish = require('./lib/cmd/publish')

const command = process.argv[2]
const args = process.argv.splice(3)

const opts = {cwd: process.cwd()}

function handleDone(err) {
  if (err) {
    console.error(`${chalk.red('error')} ${err.message}`)
    process.exit(err.code || 1)//eslint-disable-line
  }
}

if (command === 'publish') {
  publish(opts, args, handleDone)
} else {
  cmd(opts, command, args, handleDone)
}


