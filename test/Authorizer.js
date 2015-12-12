/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')

const Authorizer = require('../lib/Authorizer')
const PollSet = require('../lib/PollSet')
const VoterMap = require('../lib/VoterMap')
const constants = require('../lib/constants')
const strategies = require('../lib/strategies')

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
				.that.is.an.instanceof(VoterMap)
				.and.has.property('size', 0)
		})
		it('creates empty polls', () => {
			const authorizer = new Authorizer()
			expect(authorizer).to.have.property('polls')
				.that.is.an.instanceof(PollSet)
			expect(authorizer.polls.isEmpty()).to.be.true
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
			expect(authorizer.polls.isEmpty()).to.be.true
			authorizer.registerPoll('user', 'edit', 'project', ['isProjectOwner'], {})
			expect(authorizer.polls.size).to.equal(1)
			for (const poll of authorizer.polls) {
				expect(poll).to.have.property('strategy', constants.AFFIRMATIVE)
			}
		})
		it('throws error is registering a duplicate poll', () => {
			authorizer.registerVoter('foo', () => {})
			authorizer.registerPoll('user', 'edit', 'project', ['foo'])

			const fn = () => {
				authorizer.registerPoll('user', 'edit', 'project', ['foo'])
			}

			expect(fn).to.throw(Error, 'Cannot register duplicate poll')
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
			expect(fn).to.throw(Error, /Voter does not exist: bad, anotherbad/)
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
		afterEach(() => {
			if (strategies.execute.isSinonProxy) {
				strategies.execute.restore()
			}
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

			const spy = sinon.spy(authorizer.voters, 'validateNames')

			return authorizer.decide()
				.reflect()
				.then((i) => {
					expect(spy.called).to.be.true
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

			const spy = sinon.spy(strategies, 'execute')

			return authorizer.decide()
				.reflect()
				.then(() => {
					expect(spy.calledWith(constants.CONSENSUS)).to.be.true
				})
		})
		it('decides by the affirmative strategy', () => {
			authorizer.registerPoll(null, null, null, ['allow', 'allow'], {
				strategy: constants.AFFIRMATIVE,
			})

			const spy = sinon.spy(strategies, 'execute')

			return authorizer.decide()
				.reflect()
				.then(() => {
					expect(spy.calledWith(constants.AFFIRMATIVE)).to.be.true
				})
		})
		it('decides by the unanimous strategy', () => {
			authorizer.registerPoll(null, null, null, ['allow', 'allow'], {
				strategy: constants.UNANIMOUS,
			})

			const spy = sinon.spy(strategies, 'execute')

			return authorizer.decide()
				.reflect()
				.then(() => {
					expect(spy.calledWith(constants.UNANIMOUS)).to.be.true
				})
		})
	})
	describe('events', () => {
		context('when a poll is not found', () => {
			it('emits a pollNotFound', () => {
				const authorizer = new Authorizer()
				let emitted = false
				authorizer.on('pollNotFound', () => {
					emitted = true
				})
				return authorizer.decide()
				.then(() => {
					expect(emitted).to.be.true
				})
			})
		})
		context('when a decision is made', () => {
			it('emits voterDecision', () => {
				const authorizer = new Authorizer()
				authorizer.registerVoter('voter', () => {
					return constants.ALLOW
				})

				let emitted = false
				authorizer.on('voterDecision', () => {
					emitted = true
				})

				authorizer.registerPoll(null, null, null, ['voter'])

				return authorizer.decide()
				.then(() => {
					expect(emitted).to.be.true
				})
			})
		})
		context('when a decision produces an error', () => {
			it('emits voterDecision', () => {
				const authorizer = new Authorizer()
				authorizer.registerVoter('voter', () => {
					throw Error('external failure')
				})

				let emitted = false
				authorizer.on('voterError', () => {
					emitted = true
				})

				authorizer.registerPoll(null, null, null, ['voter'])

				return authorizer.decide()
				.catch(() => {
					expect(emitted).to.be.true
				})
			})
		})
	})
})
