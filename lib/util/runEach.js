'use strict'

/**
 * @template T
 * @param {T[]} array
 * @param {string[]} args
 * @param {(t: T, args: string[])=>Promise<any>} run
 */
module.exports = function runEach(array, args, run) {
  let maxWorkers = 0
  /** @type {string[]} */
  const newArgs = []
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    if (arg === '--mrpm-max-workers') {
      index++
      const nextArg = args[index]
      maxWorkers = Number(nextArg) || 0
      continue
    }
    if (arg.startsWith('--mrpm-max-workers=')) {
      maxWorkers = Number(arg.slice(19).trim()) || 0
      continue
    }
    newArgs.push(arg)
  }
  if (!maxWorkers || !isFinite(maxWorkers)) {
    return Promise.all(array.map((e) => run(
        e,
        args
    )))
  }
  const waits = [...array]
  /** @type {Set<Promise<any>>} */
  const jobs = new Set()

  /**
   * @param {(value?: any) => void} resolve
   * @param {(reason?: any) => void} reject
   */
  function processJobs(resolve, reject) {
    if (waits.length === 0 && jobs.size === 0) {
      resolve()
      return
    }
    while (jobs.size < maxWorkers && waits.length) {
    /** @type {any} */
      const t = waits.shift()
      const p = run(
          t,
          newArgs
      ).then(
          () => {
            jobs.delete(p)
            processJobs(
                resolve,
                reject
            )
          },
          reject
      )
      jobs.add(p)
    }
  }

  return new Promise((resolve, reject) => {
    processJobs(
        resolve,
        reject
    )
  })
}