'use strict'

const callNpm = require('../callNpm')
/**
 * @param {import('../types').PkgInfo} pkg
 * @param {string} pkgName
 * @returns {Promise<string[]>}
 */
module.exports = async function npmVersions(pkg, pkgName) {
  try {
    const vers = await callNpm(
        pkg,
        'info',
        [
          pkgName,
          'versions',
          '--json'
        ],
        {
          quiet: true,
        }
    )
    return JSON.parse(vers)
  } catch (e) {
    const r = JSON.parse(e.result)
    if (!r.error || !r.error.code || r.error.code !== 'E404') {
      throw e
    }
    // not found package
    return []
  }
}