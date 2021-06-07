/* eslint no-sync:0, no-unused-expressions:0, max-lines-per-function:0 */
'use strict'

const chai = require('chai')
const expect = chai.expect
const fs = require('fs')
const updateOutsideDependencies = require('../../../lib/util/updateOutsideDependencies')
const {initPkgs} = require('../../test-utils')

const path = require('path')

const fixturesRoot = path.resolve(
    __dirname,
    '../../../test-fixtures/lib/util/updateOutsideDependencies'
)


describe(
    'updateOutsideDependencies',
    () => {
      const opts = {
        cwd: fixturesRoot
      }
      it(
          'update versions 0.0.1',
          () => initPkgs(fixturesRoot).
            then(() => updateOutsideDependencies(
                opts,
                'mrpm',
                '0.0.1'
            )).
            then(() => {
              // check
              const content1 = JSON.parse(fs.readFileSync(
                  path.resolve(
                      fixturesRoot,
                      'packages/test1/package.json'
                  ),
                  'utf8'
              ))
              expect(content1.dependencies.mrpm).to.equal('0.0.1')
              const content2 = JSON.parse(fs.readFileSync(
                  path.resolve(
                      fixturesRoot,
                      'packages/test2/package.json'
                  ),
                  'utf8'
              ))
              expect(content2.dependencies.mrpm).to.equal('0.0.1')
              const content3 = JSON.parse(fs.readFileSync(
                  path.resolve(
                      fixturesRoot,
                      'packages/test3/package.json'
                  ),
                  'utf8'
              ))
              expect(content3.dependencies.mrpm).to.be.undefined
            })
      )
      it(
          'update versions 1.0.0',
          () => initPkgs(fixturesRoot).
            then(() => updateOutsideDependencies(
                opts,
                'mrpm',
                '1.0.0'
            )).
            then(() => {
              // check
              const content1 = JSON.parse(fs.readFileSync(
                  path.resolve(
                      fixturesRoot,
                      'packages/test1/package.json'
                  ),
                  'utf8'
              ))
              expect(content1.dependencies.mrpm).to.equal('^1.0.0')
              const content2 = JSON.parse(fs.readFileSync(
                  path.resolve(
                      fixturesRoot,
                      'packages/test2/package.json'
                  ),
                  'utf8'
              ))
              expect(content2.dependencies.mrpm).to.equal('^1.0.0')
              const content3 = JSON.parse(fs.readFileSync(
                  path.resolve(
                      fixturesRoot,
                      'packages/test3/package.json'
                  ),
                  'utf8'
              ))
              expect(content3.dependencies.mrpm).to.be.undefined
            })
      )
      it(
          'update versions 1.0.1',
          () => initPkgs(fixturesRoot).
            then(() => updateOutsideDependencies(
                opts,
                'mrpm',
                '1.0.1'
            )).
            then(() => {
              // check
              const content1 = JSON.parse(fs.readFileSync(
                  path.resolve(
                      fixturesRoot,
                      'packages/test1/package.json'
                  ),
                  'utf8'
              ))
              expect(content1.dependencies.mrpm).to.equal('^1.0.1')
              const content2 = JSON.parse(fs.readFileSync(
                  path.resolve(
                      fixturesRoot,
                      'packages/test2/package.json'
                  ),
                  'utf8'
              ))
              expect(content2.dependencies.mrpm).to.equal('^1.0.1')
            })
      )
    }
)