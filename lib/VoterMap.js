'use strict'

const assert = require('assert')
const P = require('bluebird')
const EventEmitter = require('events').EventEmitter

const Immutable = require('immutable')

class VoterMap extends EventEmitter {
	constructor(voters) {
		super()
		this.map = new Immutable.Map(voters)
	}
	set(name, voter) {
		this.map = this.map.set(name, voter)
		return this.map
	}
	find(name) {
		return this.map.get(name)
	}
	isEmpty() {
		return this.map.isEmpty()
	}
	get size() {
		return this.map.size
	}
	has(name) {
		return this.map.has(name)
	}
	[Symbol.iterator]() {
		return this.map.entries()
	}
	validateNames(names) {
		const bad = names.filter((name) => {
			return !this.map.has(name)
		})
		assert(bad.length === 0, 'Voter does not exist: ' + bad.join(', '))
	}
	filter(names) {
		const map = new VoterMap()
		const arr = names || []

		arr
			.filter((name) => {
				return this.has(name)
			})
			.map((name) => {
				return map.set(name, this.find(name))
			})
		return map
	}
	execute(subject, action, resource, context) {
		const promises = this.map.map((voter, key) => {
			return P.resolve()
			.then(() => {
				return voter(subject, action, resource, context)
			})
			.then((decision) => {
				this.emit('voterDecision', key, decision)
				return decision
			})
			.catch((err) => {
				this.emit('voterError', key, err)
				return P.reject(err)
			})
		}).toArray()

		return P.settle(promises)
			.then((iArr) => {
				const rejected = iArr.filter((i) => {
					return i.isRejected()
				}).shift()

				if (rejected) {
					return P.reject(rejected.reason())
				}

				return iArr.map((i) => {
					return i.value()
				})
			})
	}
}

module.exports = VoterMap
