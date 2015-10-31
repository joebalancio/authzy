/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect

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
		it('returns false if at least one vote is abstain', () => {
			const result = strategies.unanimous([
				constants.ALLOW,
				constants.ALLOW,
				constants.ABSTAIN,
			])
			expect(result).to.be.false
		})
	})
})
