/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect

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

			authorizer.registerVoter('dummy', voter)
			expect(authorizer.voters.size).to.equal(1)
		})
		it('throws error if voter is not a function', () => {
			const fn = authorizer.registerVoter.bind(authorizer, 'dummy', true)
			expect(fn).to.throw(Error, /Voter must be a function/)
		})
		it('throws error if name is not a function', () => {
			const fn = authorizer.registerVoter.bind(authorizer, true, true)
			expect(fn).to.throw(Error, /Name must be a string/)
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
		it('registers a poll', () => {
			authorizer.registerVoter('isProjectOwner', () => {})
			expect(authorizer.polls).to.have.property('size', 0)
			authorizer.registerPoll('user', 'edit', 'project', ['isProjectOwner'], {})
			expect(authorizer.polls).to.have.property('size', 1)
		})
		it('throws an error when voters are not given', () => {
			const fn = authorizer.registerPoll.bind(authorizer, 'user', 'edit', 'project', null, {})
			expect(fn).to.throw(Error, /Voters are required/)
		})
		it('throws an error when voters are not an array', () => {
			const fn = authorizer.registerPoll.bind(authorizer, 'user', 'edit', 'project', true, {})
			expect(fn).to.throw(Error, /Voters must be an array/)
		})
		it('throws an error when voters are empty', () => {
			const fn = authorizer.registerPoll.bind(authorizer, 'user', 'edit', 'project', [], {})
			expect(fn).to.throw(Error, /Voters must not be empty/)
		})
		it('throws an error when a voter does not exist', () => {
			const fn = authorizer.registerPoll.bind(
				authorizer, 'user', 'edit', 'project', ['bad', 'anotherbad'], {}
			)
			expect(fn).to.throw(Error, /Voter does not exist: bad,anotherbad/)
		})
	})
	describe('#registerContextResolver', () => {
		let authorizer
		beforeEach(() => {
			authorizer = new Authorizer()
		})
		it('has a default context resolver', () => {
			expect(authorizer).to.have.property('contextResolver')
				.that.is.an.instanceof(Function)
			expect(authorizer.contextResolver(1, 2, 3)).to.equal(1)
		})
		it('responds to method', () => {
			expect(authorizer).to.respondTo('registerContextResolver')
		})
		it('registers a context resolver', () => {
			const resolver = () => {}
			authorizer.registerContextResolver(resolver)
			expect(authorizer.contextResolver).to.equal(resolver)
		})
		it('throws an error when resolver is not a function', () => {
			const fn = authorizer.registerContextResolver.bind(authorizer, true)
			expect(fn).to.throw(Error, /Resolver must be a function/)
		})
	})
	describe('#decide', () => {
		it('decides')
	})
})
