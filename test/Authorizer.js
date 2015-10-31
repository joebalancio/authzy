/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect
const P = require('bluebird')

const Authorizer = require('../lib/Authorizer')

describe('Authorizer', () => {
	describe('constructor', () => {
		it('accepts options', () => {
			const authorizer = new Authorizer({foo: 'bar'})
			expect(authorizer).to.have.property('options')
				.that.has.property('foo', 'bar')
		})
		it('creates empty voters', () => {
			const authorizer = new Authorizer()
			expect(authorizer).to.have.property('voters')
				.that.is.an.instanceof(Map)
				.and.is.empty
		})
	})
	describe('#registerVoter', () => {
		let authorizer
		beforeEach(() => {
			authorizer = new Authorizer()
		})
		it('responds to method', () => {
			expect(authorizer).to.respondTo('registerVoter')
		})
		it('registers a voter', () => {
			const voter = () => {}
			expect(authorizer.voters.size).to.equal(0)

			return authorizer.registerVoter('dummy', voter)
			.reflect()
			.then((i) => {
				expect(i.isFulfilled()).to.be.true
				expect(i.value()).to.equal(voter)
				expect(authorizer.voters.size).to.equal(1)
			})
		})
		it('returns a promise', () => {
			expect(authorizer.registerVoter('dummy', () => {}))
				.to.be.an.instanceof(P)
		})
		it('throws error if voter is not a function', () => {
			return authorizer.registerVoter('dummy', true)
			.reflect()
			.then((i) => {
				expect(i.isRejected()).to.be.true
				expect(i.reason()).to.be.an.instanceof(Error)
				.and.has.property('message', 'Voter must be a function')
			})
		})
		it('throws error if name is not a function', () => {
			return authorizer.registerVoter(true, true)
			.reflect()
			.then((i) => {
				expect(i.isRejected()).to.be.true
				expect(i.reason()).to.be.an.instanceof(Error)
				.and.has.property('message', 'Name must be a string')
			})
		})
	})
	describe('#registerPoll', () => {
		it('registers a poll')
	})
	describe('#registerContextResolver', () => {
		it('registers a context resolver')
	})
	describe('#decide', () => {
		it('decides')
	})
})
