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
				.and.has.property('size', 0)
		})
		it('creates empty polls', () => {
			const authorizer = new Authorizer()
			expect(authorizer).to.have.property('polls')
				.that.is.an.instanceof(Map)
				.and.has.property('size', 0)
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
		let authorizer
		beforeEach(() => {
			authorizer = new Authorizer()
		})
		it('responds to method', () => {
			expect(authorizer).to.respondTo('registerPoll')
		})
		it('returns a promise', () => {
			expect(authorizer.registerPoll('user', 'edit', 'project', ['isProjectOwner'], {}))
			.to.be.an.instanceof(P)
		})
		it('registers a poll', () => {
			return authorizer.registerVoter('isProjectOwner', () => {})
			.then(() => {
				expect(authorizer.polls).to.have.property('size', 0)
				return authorizer.registerPoll('user', 'edit', 'project', ['isProjectOwner'], {})
			})
			.reflect()
			.then((i) => {
				expect(i.isFulfilled()).to.be.true
				expect(i.value()).to.equal(authorizer)
				expect(authorizer.polls).to.have.property('size', 1)
			})
		})
		it('rejects when voters are not given', () => {
			return authorizer.registerPoll('user', 'edit', 'project', null, {})
			.reflect()
			.then((i) => {
				expect(i.isRejected()).to.be.true
				expect(i.reason()).to.be.an.instanceof(Error)
				.and.has.property('message', 'Voters are required')
			})
		})
		it('rejects when voters are not an array', () => {
			return authorizer.registerPoll('user', 'edit', 'project', true, {})
			.reflect()
			.then((i) => {
				expect(i.isRejected()).to.be.true
				expect(i.reason()).to.be.an.instanceof(Error)
				.and.has.property('message', 'Voters must be an array')
			})
		})
		it('rejects when voters are empty', () => {
			return authorizer.registerPoll('user', 'edit', 'project', [], {})
			.reflect()
			.then((i) => {
				expect(i.isRejected()).to.be.true
				expect(i.reason()).to.be.an.instanceof(Error)
				.and.has.property('message', 'Voters must not be empty')
			})
		})
		it('rejects when a voter does not exist', () => {
			return authorizer.registerPoll('user', 'edit', 'project', ['bad', 'anotherbad'], {})
			.reflect()
			.then((i) => {
				expect(i.isRejected()).to.be.true
				expect(i.reason()).to.be.an.instanceof(Error)
				.and.has.property('message', 'Voter does not exist: bad,anotherbad')
			})
		})
	})
	describe('#registerContextResolver', () => {
		it('registers a context resolver')
	})
	describe('#decide', () => {
		it('decides')
	})
})
