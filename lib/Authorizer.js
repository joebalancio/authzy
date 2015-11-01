'use strict'

const assert = require('assert')
const P = require('bluebird')

const strategies = require('./strategies')
const Poll = require('./Poll')
const PollSet = require('./PollSet')
const VoterMap = require('./VoterMap')

class Authorizer {
	constructor(options) {
		this.options = options
		this.voters = new VoterMap()
		this.polls = new PollSet()
		this.contextParser = (obj) => obj
	}
	registerVoter(name, voter) {
		assert(typeof name === 'string', 'Name must be a string')
		assert(typeof voter === 'function', 'Voter must be a function')
		this.voters.set(name, voter)
		return voter
	}
	registerPoll(subject, action, resource, voters, options) {
		const poll = new Poll(subject, action, resource, voters, options)
		this.voters.validateNames(voters)
		if (this.polls.matches(subject, action, resource)) {
			throw new Error('Cannot register duplicate poll')
		}

		this.polls.add(poll)
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

		const poll = this.polls.find(_subject, _action, _resource)
		if (!poll) {
			return P.resolve(false)
		}

		this.voters.validateNames(poll.voters)

		return this.voters
			.filter(poll.voters)
			.execute(_subject, _action, _resource, _context)
			.then(strategies.execute.bind(null, poll.strategy))
	}
}

module.exports = Authorizer
