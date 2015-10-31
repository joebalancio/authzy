/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')

const Authorizer = require('../lib/Authorizer')
const constants = require('../lib/constants')

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
				.that.is.an.instanceof(Array)
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
			expect(authorizer.polls).to.have.length(0)
			authorizer.registerPoll('user', 'edit', 'project', ['isProjectOwner'], {})
			expect(authorizer.polls).to.have.length(1)
			authorizer.polls.forEach((poll, config) => {
				expect(poll).to.have.property('strategy', constants.AFFIRMATIVE)
			})
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
	describe('#registerContextParser', () => {
		let authorizer
		beforeEach(() => {
			authorizer = new Authorizer()
		})
		it('has a default context parser', () => {
			expect(authorizer).to.have.property('contextParser')
				.that.is.an.instanceof(Function)
			expect(authorizer.contextParser(1, 2, 3)).to.equal(1)
		})
		it('responds to method', () => {
			expect(authorizer).to.respondTo('registerContextParser')
		})
		it('registers a context parser', () => {
			const parser = () => {}
			authorizer.registerContextParser(parser)
			expect(authorizer.contextParser).to.equal(parser)
		})
		it('throws an error when parser is not a function', () => {
			const fn = authorizer.registerContextParser.bind(authorizer, true)
			expect(fn).to.throw(Error, /Parser must be a function/)
		})
	})
	describe('#decide', () => {
		let authorizer
		beforeEach(() => {
			authorizer = new Authorizer()
			authorizer.registerVoter('error', () => {
				throw Error('external failure')
			})
			authorizer.registerVoter('allow', () => {
				return constants.ALLOW
			})
			authorizer.registerVoter('deny', () => {
				return constants.DENY
			})
			authorizer.registerVoter('abstain', () => {
				return constants.ABSTAIN
			})
		})
		it('returns false by default when no polls are matched', () => {
			return authorizer.decide()
				.reflect()
				.then((i) => {
					expect(i.isFulfilled()).to.be.true
					expect(i.value()).to.be.false
				})
		})
		it('resolves with true when a matched poll allow', () => {
			authorizer.registerPoll(null, null, null, ['allow'])

			return authorizer.decide()
				.reflect()
				.then((i) => {
					expect(i.isFulfilled()).to.be.true
					expect(i.value()).to.be.true
				})
		})
		it('rejects with error when a voter fails', () => {
			authorizer.registerPoll(null, null, null, ['error'])

			return authorizer.decide()
				.reflect()
				.then((i) => {
					expect(i.isRejected()).to.be.true
					expect(i.reason()).to.have.property('message', 'external failure')
				})
		})
		it('decides by the consensus strategy', () => {
			authorizer.registerPoll(null, null, null, ['allow', 'allow'], {
				strategy: constants.CONSENSUS,
			})

			const spy = sinon.spy(authorizer, 'findPoll')

			return authorizer.decide()
				.reflect()
				.then(() => {
					expect(spy.called).to.be.true
					const poll = spy.firstCall.returnValue
					expect(poll.strategy).to.equal(constants.CONSENSUS)
				})
		})
		it('decides by the affirmative strategy', () => {
			authorizer.registerPoll(null, null, null, ['allow', 'allow'], {
				strategy: constants.AFFIRMATIVE,
			})

			const spy = sinon.spy(authorizer, 'findPoll')

			return authorizer.decide()
				.reflect()
				.then(() => {
					expect(spy.called).to.be.true
					const poll = spy.firstCall.returnValue
					expect(poll.strategy).to.equal(constants.AFFIRMATIVE)
				})
		})
		it('decides by the unanimous strategy', () => {
			authorizer.registerPoll(null, null, null, ['allow', 'allow'], {
				strategy: constants.UNANIMOUS,
			})

			const spy = sinon.spy(authorizer, 'findPoll')

			return authorizer.decide()
				.reflect()
				.then(() => {
					expect(spy.called).to.be.true
					const poll = spy.firstCall.returnValue
					expect(poll.strategy).to.equal(constants.UNANIMOUS)
				})
		})
	})
	describe('#findPoll', () => {
		let authorizer
		beforeEach(() => {
			authorizer = new Authorizer()
			authorizer.registerVoter('allow', () => {
				return constants.ALLOW
			})
		})
		it('returns false by default when no polls are matched', () => {
			expect(authorizer.findPoll()).to.be.undefined
		})
		it('returns poll if matched', () => {
			authorizer.registerPoll('user', 'edit', 'page', ['allow', 'allow'])
			expect(authorizer.findPoll('user', 'edit', 'page')).to.exist
		})
	})
})
