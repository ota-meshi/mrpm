'use strict'

const callNpm = require('../callNpm')

module.exports = function npmVersions(pkg, pkgName) {
  return callNpm(pkg, 'info', [pkgName, 'versions', '--json'], {
    quiet: true,
  }).then((vers) => JSON.parse(vers), (e) => {
    const r = JSON.parse(e.result)
    if (!r.error || !r.error.code || r.error.code !== 'E404') {
      throw e
    }
    // not found package
    return []
  })
}