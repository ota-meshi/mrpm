'use strict'


// eslint-disable-next-line no-extra-parens
const chalk = /** @type {import('chalk').Chalk} */(/** @type {unknown} */(require('chalk')))
const prepender = require('./prepender')
const nodeSpawn = require('child_process').spawn

/**
 *
 * @param {string} pkgNm
 * @param {string} script
 * @param {string[]} args
 * @param { {cwd?: string, quiet?: boolean} } opts
 * @returns {Promise<string>}
 */
module.exports = function spawn(pkgNm, script, args, opts) {
  return new Promise((resolve, reject) => {
    console.log(chalk.gray(`start@${pkgNm} > ${script} ${args.join(' ')}`))
    const p = nodeSpawn(
        /^win/.test(process.platform) ? `${script}.cmd` : script,
        args,
        {cwd: opts.cwd}
    )

    let result = ''
    /** @param {string} data */
    const onData = (data) => {
      result += data
    }
    /**
     * @type { (()=>void)[]}
     */
    const removeListeners = []
    /** @param {number} code */
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
        // @ts-expect-error
        err.code = code
        // @ts-expect-error
        err.scope = pkgNm
        // @ts-expect-error
        err.result = result
        reject(err)
      }
    }
    removeListeners.push(
        () => p.stdout.removeListener(
            'data',
            onData
        ),
        () => p.removeListener(
            'exit',
            onExit
        )
    )
    if (!opts.quiet) {
      removeListeners.push(...pipe(
          p,
          pkgNm
      ))
    }
    p.stdout.on(
        'data',
        onData
    )
    p.on(
        'exit',
        onExit
    )
  })
}

/**
 *
 * @param {import('child_process').ChildProcessWithoutNullStreams} p
 * @param {string} pkgNm
 */
function pipe(p, pkgNm) {
  const stdoutPrepender = prepender(chalk.whiteBright.bgGreen(`${pkgNm} `))
  const stdoutPrependerPipe = p.stdout.pipe(stdoutPrepender)
  stdoutPrependerPipe.pipe(process.stdout)

  const stderrPrepender = prepender(chalk.whiteBright.bgRed(`${pkgNm} `))
  const stderrPrependerPipe = p.stderr.pipe(stderrPrepender)
  stderrPrependerPipe.pipe(process.stderr)
  return [
    () => p.stdout.unpipe(stdoutPrepender),
    () => stdoutPrependerPipe.unpipe(process.stdout),
    () => p.stderr.unpipe(stderrPrepender),
    () => stderrPrependerPipe.unpipe(process.stderr)
  ]
}
