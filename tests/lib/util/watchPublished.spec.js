'use strict'

const chai = require('chai')
const expect = chai.expect
const watchPublished = require('../../../lib/util/watchPublished')


describe(
    'watchPublished',
    () => {
      it(
          'watch published',
          () => watchPublished({
            name: 'mrpm',
            version: '2.0.0',
            rootDir: process.cwd()
          }).
            then(() => {
              expect(1).to.equal(1)
            })
      )
    }
)