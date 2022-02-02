/* eslint no-sync:0, no-unused-expressions:0 */
'use strict'

const chai = require('chai')
const expect = chai.expect
const path = require('path')
const mrpm = require('../index')
const {initPkgs} = require('./test-utils')

const pkgRoot = path.resolve(
    __dirname,
    '../test-fixtures/testpkg'
)

beforeEach(() => initPkgs(pkgRoot).then(() => {
  const opts = {
    cwd: pkgRoot
  }
  return mrpm(
      opts,
      'i',
      [],
      (err) => {
        if (err) {
          console.error(err)
        }
        expect(err).to.be.a('null')
      }
  )
}))


describe(
    'mrpm with max-worker',
    () => {
      it(
          'run scripts in sub-packages',
          () => {
            const opts = {
              cwd: pkgRoot
            }

            return mrpm(
                opts,
                'run',
                [
                  'test',
                  '--mrpm-max-workers=1'
                ],
                (err) => {
                  expect(err).to.be.a('null')
                }
            )
          }
      )

      it(
          'fail to run scripts in sub-packages',
          () => {
            const opts = {
              cwd: pkgRoot
            }

            return mrpm(
                opts,
                'run',
                [
                  'fail',
                  '--mrpm-max-workers',
                  '1'
                ],
                (err) => {
                  expect(err.message).to.equal('Failure')
                  expect(err.scope).to.equal('sub2')
                  expect(err.code).to.equal(1)
                }
            )
          }
      )

      it(
          'publish to run scripts in sub-packages',
          () => {
            const opts = {
              cwd: pkgRoot
            }

            return mrpm(
                opts,
                'publish',
                [
                  '--mrpm-max-workers',
                  '1'
                ],
                (err) => {
                  expect(err).to.be.a('null')
                }
            )
          }
      )
    }
)