'use strict'

const path = require('path')
const rimraf = require('rimraf')

module.exports = {
  initPkgs(pkgRoot) {
    return new Promise((resolve) => {
      rimraf(
          path.resolve(
              pkgRoot,
              '**/*/node_modules'
          ),
          () => rimraf(
              path.resolve(
                  pkgRoot,
                  '*/package-lock.json'
              ),
              () => {
                resolve()
              }
          )
      )
    })
  }
}