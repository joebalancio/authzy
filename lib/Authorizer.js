'use strict'

const assert = require('assert')
const P = require('bluebird')

class Authorizer {
	constructor(options) {
		this.options = options
		this.voters = new Map()
		this.polls = new Map()
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
	registerPoll(subject, action, resource, voters, options) {
		return P.resolve()
		.then(() => {
			const self = this
			assert(!!voters, 'Voters are required')
			assert(voters instanceof Array, 'Voters must be an array')
			assert(voters.length, 'Voters must not be empty')

			// get bad voters
			const badVoters = voters.filter((voter) => {
				return !self.voters.has(voter)
			})

			assert(badVoters.length === 0, 'Voter does not exist: ' + badVoters)
		})
		.then(() => {
			this.polls.set({
				subject: subject,
				action: action,
				resource: resource,
				options: options,
			}, voters)

			return this
		})
	}
}

module.exports = Authorizer
