'use strict'

const chai = require('chai')
const expect = chai.expect
const npmVersions = require('../../../lib/util/npmVersions')


describe('npmVersions', () => {
  it('get versions', () => npmVersions({
    name: 'test',
    rootDir: process.cwd()
  }, 'mrpm').
    then((vers) => {
      expect(vers).to.include.members(['0.0.1', '1.0.0', '1.0.1'])
    }))
  it('404 versions', () => npmVersions({
    name: 'test',
    rootDir: process.cwd()
  }, 'testtest404').
    then((vers) => {
      expect(vers.length).to.equal(0)
    }))
})