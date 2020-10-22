'use strict'

const Transform = require('stream').Transform

/**
 * @param {string} prefixData
 */
module.exports = function(prefixData) {
  const prefix = Buffer.from(prefixData)
  /** @type {Buffer} */
  let rest
  return new Transform({
    /**
     * @param {Buffer} chunk
     * @param {unknown} _encoding
     * @param {()=>void} done
     */
    transform(chunk, _encoding, done) {
      rest = rest && rest.length
        ? Buffer.concat([
          rest,
          chunk
        ])
        : chunk

      let index

      // As long as we keep finding newlines, keep making slices of the buffer and push them to the
      // readable side of the transform stream
      while ((index = rest.indexOf('\n')) !== -1) {
      // The `end` parameter is non-inclusive, so increase it to include the newline we found
        const line = rest.slice(
            0,
            ++index
        )
        // `start` is inclusive, but we are already one char ahead of the newline -> all good
        rest = rest.slice(index)
        // We have a single line here! Prepend the string we want
        this.push(Buffer.concat([
          prefix,
          line
        ]))
      }

      done()
    },

    // Called before the end of the input so we can handle any remaining
    // data that we have saved
    flush(done) {
    // If we have any remaining data in the cache, send it out
      if (rest && rest.length) {
        done(
            null,
            Buffer.concat([
              prefix,
              rest
            ])
        )
      }
    },
  })
}
