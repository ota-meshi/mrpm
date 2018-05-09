/* eslint no-sync:0, no-unused-expressions:0 */
'use strict'

const chai = require('chai')
const {expect} = chai
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')
const mrpm = require('../index')


beforeEach(() => new Promise(((resolve) => {
  rimraf(
      path.resolve(__dirname, '../testpkg/**/*/node_modules'),
      () => {
        rimraf(
            path.resolve(
                __dirname,
                '../testpkg/packages/*/package-lock.json'
            ),
            () => {
              const opts = {
                cwd: path.resolve(__dirname, '../testpkg')
              }

              mrpm(opts, 'i', [], (err) => {
                expect(err).to.be.a('null')
                resolve()
              })
            }
        )
      }
  )
})))

describe('mrpm', () => {
  it('install sub-package’s dependencies', () => {
    const stats = fs.lstatSync(
        path.resolve(__dirname, '../testpkg/packages/sub1/node_modules')
    )
    const files = fs.readdirSync(
        path.resolve(__dirname, '../testpkg/packages/sub2/node_modules')
    )

    expect(stats.isDirectory()).to.be.true
    expect(files).to.contain('cheetah-grid')
  })

  it('run scripts in sub-packages', () => {
    const opts = {
      cwd: path.resolve(__dirname, '../testpkg')
    }

    return mrpm(opts, 'run', ['test'], (err) => {
      expect(err).to.be.a('null')
    })
  })

  it('fail to run scripts in sub-packages', () => {
    const opts = {
      cwd: path.resolve(__dirname, '../testpkg')
    }

    return mrpm(opts, 'run', ['fail'], (err) => {
      expect(err.message).to.equal('Failure')
      expect(err.scope).to.equal('sub2')
      expect(err.code).to.equal(1)
    })
  })

  it('publish to run scripts in sub-packages', () => {
    const opts = {
      cwd: path.resolve(__dirname, '../testpkg')
    }

    return mrpm(opts, 'publish', [], (err) => {
      expect(err).to.be.a('null')
    })
  })
})