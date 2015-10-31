'use strict'

const assert = require('assert')
const P = require('bluebird')

class Authorizer {
	constructor(options) {
		this.options = options
		this.voters = new Map()
	}
	registerVoter(name, voter) {
		return P.resolve()
		.then(() => {
			assert(typeof name === 'string', 'Name must be a string')
			assert(typeof voter === 'function', 'Voter must be a function')
		})
		.then(() => {
			this.voters.set(name, voter)
			return voter
		})
	}
}

module.exports = Authorizer
