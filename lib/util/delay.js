'use strict'
/**
 * @param {number} timeout
 */
module.exports = function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(
        resolve,
        timeout
    )
  })
}