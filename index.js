'use strict'

const Authorizer = require('./lib/Authorizer')
const constants = require('./lib/constants')

module.exports = (options) => {
	return new Authorizer(options || {})
}

module.exports.constants = Object.freeze(constants)
