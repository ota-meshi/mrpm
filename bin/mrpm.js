#!/usr/bin/env node

'use strict'


const chalk = require('chalk')
const mrpm = require('mrpm')

const command = process.argv[2]
const args = process.argv.splice(3)

const opts = {cwd: process.cwd()}

function handleDone(err) {
  if (err) {
    console.error(`${chalk.red('error')} ${err.message}`)
    process.exit(err.code || 1)//eslint-disable-line
  }
}

mrpm(opts, command, args, handleDone)


