'use strict'

const Authorizer = require('./lib/Authorizer')
const constants = require('./lib/constants')

module.exports = (options) => {
	return new Authorizer(options || {})
}

module.exports.constants = Object.freeze(constants)

module.exports.voters = Object.freeze({
	allow() {
		return constants.ALLOW
	},
	deny() {
		return constants.DENY
	},
	abstain() {
		return constants.ABSTAIN
	},
})
