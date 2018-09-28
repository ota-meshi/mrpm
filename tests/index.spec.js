/* eslint no-sync:0, no-unused-expressions:0 */
'use strict'

const chai = require('chai')
const expect = chai.expect
const fs = require('fs')
const path = require('path')
const mrpm = require('../index')
const {initPkgs} = require('./test-utils')

const pkgRoot = path.resolve(__dirname, '../test-fixtures/testpkg')

beforeEach(() => initPkgs(pkgRoot).then(
    () => {
      const opts = {
        cwd: pkgRoot
      }
      return new Promise((resolve) => mrpm(opts, 'i', [], (err) => {
        if (err) {
          console.error(err)
        }
        expect(err).to.be.a('null')
        resolve()
      }))
    }
))


describe('mrpm', () => {
  it('install sub-package’s dependencies', () => {
    const stats = fs.lstatSync(
        path.resolve(pkgRoot, './packages/sub1/node_modules')
    )
    const files = fs.readdirSync(
        path.resolve(pkgRoot, './packages/sub2/node_modules')
    )

    expect(stats.isDirectory()).to.be.true
    expect(files).to.contain('cheetah-grid')
  })

  it('run scripts in sub-packages', () => {
    const opts = {
      cwd: pkgRoot
    }

    return mrpm(opts, 'run', ['test'], (err) => {
      expect(err).to.be.a('null')
    })
  })

  it('fail to run scripts in sub-packages', () => {
    const opts = {
      cwd: pkgRoot
    }

    return mrpm(opts, 'run', ['fail'], (err) => {
      expect(err.message).to.equal('Failure')
      expect(err.scope).to.equal('sub2')
      expect(err.code).to.equal(1)
    })
  })

  it('publish to run scripts in sub-packages', () => {
    const opts = {
      cwd: pkgRoot
    }

    return mrpm(opts, 'publish', [], (err) => {
      expect(err).to.be.a('null')
    })
  })
})