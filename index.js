'use strict'

const Authorizer = require('./lib/Authorizer')

module.exports = (options) => {
	return new Authorizer(options || {})
}
