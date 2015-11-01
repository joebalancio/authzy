'use strict'

const Immutable = require('immutable')

class PollSet {
	constructor(polls) {
		this.set = new Immutable.Set(polls)
	}
	add(poll) {
		if (!this.matches(poll.subject, poll.action, poll.resource)) {
			this.set = this.set.add(poll)
		}
		return this.set
	}
	find(subject, action, resource) {
		return this.set.find((poll) => {
			return poll.matches(subject, action, resource)
		})
	}
	isEmpty() {
		return this.set.isEmpty()
	}
	get size() {
		return this.set.size
	}
	matches(subject, action, resource) {
		return this.set.some((poll) => {
			return poll.matches(subject, action, resource)
		})
	}
	[Symbol.iterator]() {
		return this.set.values()
	}
}

module.exports = PollSet
