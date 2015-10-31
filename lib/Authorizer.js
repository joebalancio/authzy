'use strict'

const assert = require('assert')
const P = require('bluebird')

const constants = require('../lib/constants')

class Authorizer {
	constructor(options) {
		this.options = options
		this.voters = new Map()
		this.polls = new Map()
		this.contextParser = (obj) => obj
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
	registerContextParser(parser) {
		assert(parser instanceof Function, 'Parser must be a function')
		this.contextParser = parser
	}
	decide(subject, action, resource, context) {
		const _subject = subject || null
		const _action = action || null
		const _resource = resource || null
		const _context = this.contextParser(context)

		const voters = this.findVoters(_subject, _action, _resource)
		if (!voters) {
			return P.resolve(false)
		}

		const voterPromises = voters
		.filter((voter) => {
			return this.voters.has(voter)
		})
		.map((voter) => {
			return P.resolve()
			.then(() => {
				return this.voters.get(voter)(_subject, _action, _resource, _context)
			})
		})

		return P.settle(voterPromises)
		.then((iArr) => {
			const rejected = iArr.filter((i) => {
				return i.isRejected()
			}).shift()
			if (rejected) {
				return P.reject(rejected.reason())
			}

			// Affirmative strategy
			const result = iArr.some((i) => {
				return i.value() === constants.ALLOW
			})
			return P.resolve(result)
		})
	}
	findVoters(subject, action, resource) {
		for (const entry of this.polls.entries()) {
			const poll = entry[0]
			const voters = entry[1]
			if (poll.subject === subject
				&& poll.action === action
				&& poll.resource === resource) {
				return voters
			}
		}
	}
}

module.exports = Authorizer
