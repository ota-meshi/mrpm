'use strict'

const chalk = require('chalk')
const prepender = require('./prepender')
const nodeSpawn = require('child_process').spawn

module.exports = function spawn(pkgNm, script, args, opts) {
  return new Promise((resolve, reject) => {
    console.log(chalk.gray(`start@${pkgNm} > ${script} ${args.join(' ')}`))
    const p = nodeSpawn(/^win/.test(process.platform) ? `${script}.cmd` : script, args, {cwd: opts.cwd})

    let result = ''
    const onData = (data) => {
      result += data
    }
    const removeListeners = []
    const onExit = (code) => {
      removeListeners.forEach((f) => f())
      if (code === 0) {
        if (!opts.quiet) {
          console.log(chalk.gray(`end@${pkgNm}`))
        }
        resolve(result)
      } else {
        const err = new Error('Failure')
        if (!opts.quiet) {
          console.error(chalk.red(`end@${pkgNm} \`exit ${code}\``))
        }
        err.code = code
        err.scope = pkgNm
        err.result = result
        reject(err)
      }
    }
    removeListeners.push(
        () => p.stdout.removeListener('data', onData),
        () => p.removeListener('exit', onExit)
    )
    if (!opts.quiet) {
      removeListeners.push(...pipe(p, pkgNm))
    }
    p.stdout.on('data', onData)
    p.on('exit', onExit)
  })
}

function pipe(p, pkgNm) {
  const stdoutPrepender = prepender(chalk.whiteBright.bgGreen(`${pkgNm} `))
  let stdoutPrependerPipe
  (stdoutPrependerPipe = p.stdout.
    pipe(stdoutPrepender)).
    pipe(process.stdout)
  const stderrPrepender = prepender(chalk.whiteBright.bgRed(`${pkgNm} `))
  let stderrPrependerPipe
  (stderrPrependerPipe = p.stderr.
    pipe(stderrPrepender)).
    pipe(process.stderr)
  return [
    () => p.stdout.unpipe(stdoutPrepender),
    () => stdoutPrependerPipe.unpipe(process.stdout),
    () => p.stderr.unpipe(stderrPrepender),
    () => stderrPrependerPipe.unpipe(process.stderr)
  ]
}
