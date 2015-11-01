'use strict'

const assert = require('assert')
const constants = require('./constants')

class Poll {
	constructor(subject, action, resource, voters, options) {
		assert(!!voters, 'Voters are required')
		assert(voters instanceof Array, 'Voters must be an array')
		assert(voters.length, 'Voters must not be empty')

		this.subject = subject
		this.action = action
		this.resource = resource
		this.voters = voters
		this.strategy = (options || {}).strategy || constants.AFFIRMATIVE
	}
	// TODO: DEPRECATE
	validateVoters(voterMap) {
		// get bad voters
		const badVoters = this.voters.filter((voter) => {
			return !voterMap.has(voter)
		})

		assert(badVoters.length === 0, 'Voter does not exist: ' + badVoters)
	}
	matches(subject, action, resource) {
		return this.subject === subject
			&& this.action === action
			&& this.resource === resource
	}
}

module.exports = Poll
