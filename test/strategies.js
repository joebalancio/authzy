/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect
const P = require('bluebird')
const sinon = require('sinon')

const constants = require('../lib/constants')
const strategies = require('../lib/strategies')

describe('strategies', () => {
	describe('.affirmative', () => {
		it('returns true for if at least vote allows', () => {
			const result = strategies.affirmative([
				constants.ALLOW,
				constants.ABSTAIN,
				constants.DENY,
			])
			expect(result).to.be.true
		})
		it('returns false for if no vote allows', () => {
			const result = strategies.affirmative([
				constants.ABSTAIN,
				constants.DENY,
			])
			expect(result).to.be.false
		})
	})

	describe('.consensus', () => {
		it('returns true if there are more votes that allow than deny', () => {
			const result = strategies.consensus([
				constants.ALLOW,
				constants.ALLOW,
				constants.DENY,
			])
			expect(result).to.be.true
		})
		it('returns false if there are more votes that deny than allow', () => {
			const result = strategies.consensus([
				constants.ALLOW,
				constants.DENY,
				constants.DENY,
			])
			expect(result).to.be.false
		})
		it('returns true if there are equal votes deny and allow', () => {
			const result = strategies.consensus([
				constants.ALLOW,
				constants.ALLOW,
				constants.DENY,
				constants.DENY,
			])
			expect(result).to.be.true
		})
		it('returns false if all abstain', () => {
			const result = strategies.consensus([
				constants.ABSTAIN,
				constants.ABSTAIN,
				constants.ABSTAIN,
			])
			expect(result).to.be.false
		})
	})

	describe('.unanimous', () => {
		it('returns true if all votes allow', () => {
			const result = strategies.unanimous([
				constants.ALLOW,
				constants.ALLOW,
				constants.ALLOW,
			])
			expect(result).to.be.true
		})
		it('returns false if at least one vote is deny', () => {
			const result = strategies.unanimous([
				constants.ALLOW,
				constants.ALLOW,
				constants.DENY,
			])
			expect(result).to.be.false
		})
		it('returns true if mixed allow and abstain', () => {
			const result = strategies.unanimous([
				constants.ALLOW,
				constants.ALLOW,
				constants.ABSTAIN,
			])
			expect(result).to.be.true
		})
		it('returns false if all abstain', () => {
			const result = strategies.unanimous([
				constants.ABSTAIN,
				constants.ABSTAIN,
				constants.ABSTAIN,
			])
			expect(result).to.be.false
		})
	})
	describe('#execute', () => {
		afterEach(() => {
			if (strategies.affirmative.isSinonProxy) {
				strategies.affirmative.restore()
			}
			if (strategies.consensus.isSinonProxy) {
				strategies.consensus.restore()
			}
			if (strategies.unanimous.isSinonProxy) {
				strategies.unanimous.restore()
			}
		})
		it('returns a promise', () => {
			expect(strategies.execute(null, null))
			.to.be.an.instanceof(P)
		})
		it('resolves false if no strategy found', () => {
			return strategies.execute(null, null)
				.reflect()
				.then((i) => {
					expect(i.isFulfilled()).to.be.true
					expect(i.value()).to.be.false
				})
		})
		it('picks the affirmative strategy', () => {
			sinon.stub(strategies, 'affirmative')
				.returns(true)
			return strategies.execute(constants.AFFIRMATIVE, null)
				.reflect()
				.then((i) => {
					expect(i.isFulfilled()).to.be.true
					expect(i.value()).to.be.true
					expect(strategies.affirmative.called).to.be.true
				})
		})
		it('picks the consensus strategy', () => {
			sinon.stub(strategies, 'consensus')
				.returns(true)
			return strategies.execute(constants.CONSENSUS, null)
				.reflect()
				.then((i) => {
					expect(i.isFulfilled()).to.be.true
					expect(i.value()).to.be.true
					expect(strategies.consensus.called).to.be.true
				})
		})
		it('picks the unanimous strategy', () => {
			sinon.stub(strategies, 'unanimous')
				.returns(true)
			return strategies.execute(constants.UNANIMOUS, null)
				.reflect()
				.then((i) => {
					expect(i.isFulfilled()).to.be.true
					expect(i.value()).to.be.true
					expect(strategies.unanimous.called).to.be.true
				})
		})
	})
})
