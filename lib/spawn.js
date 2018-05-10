'use strict'

const chalk = require('chalk')
const prepender = require('./prepender')
const nodeSpawn = require('child_process').spawn

module.exports = function spawn(pkgNm, script, args, opts) {
  return new Promise((resolve, reject) => {
    console.log(chalk.gray(`start@${pkgNm} > ${script} ${args.join(' ')}`))
    const p = nodeSpawn(/^win/.test(process.platform) ? `${script}.cmd` : script, args, {cwd: opts.cwd})

    let result = ''
    if (!opts.quiet) {
      p.stdout.pipe(prepender(chalk.whiteBright.bgGreen(`${pkgNm} `))).pipe(process.stdout)
      p.stderr.pipe(prepender(chalk.whiteBright.bgRed(`${pkgNm} `))).pipe(process.stderr)
      p.stdout.on('data', (data) => {
        result += data
      })
    }

    p.on('exit', (code) => {
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
    })
  })
}
