'use strict'

const {Transform} = require('stream')


module.exports = function(prefixData) {
  const prefix = Buffer.from(prefixData)
  return new Transform({
    transform(chunk, encoding, done) {
      this._rest = this._rest && this._rest.length
        ? Buffer.concat([this._rest, chunk])
        : chunk

      let index

      // As long as we keep finding newlines, keep making slices of the buffer and push them to the
      // readable side of the transform stream
      while ((index = this._rest.indexOf('\n')) !== -1) {
      // The `end` parameter is non-inclusive, so increase it to include the newline we found
        const line = this._rest.slice(0, ++index)
        // `start` is inclusive, but we are already one char ahead of the newline -> all good
        this._rest = this._rest.slice(index)
        // We have a single line here! Prepend the string we want
        this.push(Buffer.concat([prefix, line]))
      }

      done()
    },

    // Called before the end of the input so we can handle any remaining
    // data that we have saved
    flush(done) {
    // If we have any remaining data in the cache, send it out
      if (this._rest && this._rest.length) {
        done(null, Buffer.concat([prefix, this._rest]))
      }
    },
  })
}
