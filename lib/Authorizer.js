'use strict'

const assert = require('assert')

class Authorizer {
	constructor(options) {
		this.options = options
		this.voters = new Map()
		this.polls = new Map()
	}
	registerVoter(name, voter) {
		assert(typeof name === 'string', 'Name must be a string')
		assert(typeof voter === 'function', 'Voter must be a function')
		this.voters.set(name, voter)
		return voter
	}
	registerPoll(subject, action, resource, voters, options) {
		const self = this
		assert(!!voters, 'Voters are required')
		assert(voters instanceof Array, 'Voters must be an array')
		assert(voters.length, 'Voters must not be empty')

		// get bad voters
		const badVoters = voters.filter((voter) => {
			return !self.voters.has(voter)
		})

		assert(badVoters.length === 0, 'Voter does not exist: ' + badVoters)

		this.polls.set({
			subject: subject,
			action: action,
			resource: resource,
			options: options,
		}, voters)
	}
}

module.exports = Authorizer
