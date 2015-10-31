'use strict'

const assert = require('assert')
const P = require('bluebird')

const constants = require('./constants')
const strategies = require('./strategies')

class Authorizer {
	constructor(options) {
		this.options = options
		this.voters = new Map()
		this.polls = []
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
		const _options = options || {}
		assert(!!voters, 'Voters are required')
		assert(voters instanceof Array, 'Voters must be an array')
		assert(voters.length, 'Voters must not be empty')

		// get bad voters
		const badVoters = voters.filter((voter) => {
			return !self.voters.has(voter)
		})

		assert(badVoters.length === 0, 'Voter does not exist: ' + badVoters)

		this.polls.push({
			subject: subject,
			action: action,
			resource: resource,
			voters: voters,
			options: Object.assign({}, {
				strategy: _options.strategy || constants.AFFIRMATIVE,
			}),
		})
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

		const poll = this.findPoll(_subject, _action, _resource)
		if (!poll) {
			return P.resolve(false)
		}

		const voterPromises = poll.voters
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

			const votes = iArr.map((i) => {
				return i.value()
			})

			// Affirmative strategy
			switch (poll.options.strategy) {
				case constants.AFFIRMATIVE:
					return P.resolve(strategies.affirmative(votes))
				case constants.CONSENSUS:
					return P.resolve(strategies.consensus(votes))
				case constants.UNANIMOUS:
					return P.resolve(strategies.unanimous(votes))
				default:
					return P.resolve(false)

			}
			return P.resolve(false)
		})
	}
	findPoll(subject, action, resource) {
		return this.polls.filter((poll) => {
			return (poll.subject === subject
				&& poll.action === action
				&& poll.resource === resource)
		}).shift()
	}
}

module.exports = Authorizer
