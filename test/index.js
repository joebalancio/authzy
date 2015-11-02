/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect

const authzy = require('../')
const Authorizer = require('../lib/Authorizer')
const constants = require('../lib/constants')

describe('authzy', () => {
	describe('create', () => {
		it('creates', () => {
			const authorizer = authzy()
			expect(authorizer).to.be.an.instanceof(Authorizer)
		})
		it('creates with options', () => {
			const authorizer = authzy({foo: 'bar'})
			expect(authorizer).to.have.property('options')
				.that.has.property('foo', 'bar')
		})
		it('passes empty options object to Authorizer', () => {
			const authorizer = authzy()
			expect(authorizer).to.have.property('options')
				.that.is.an('object')
		})
	})
	it('exports constants', () => {
		expect(authzy.constants).to.equal(constants)
		expect(Object.isFrozen(constants)).to.be.true
	})
	describe('voters', () => {
		it('exports default voters', () => {
			expect(authzy.voters).to.be.an('object')
		})
		it('exports default allow voter', () => {
			expect(authzy.voters.allow()).to.equal(constants.ALLOW)
		})
		it('exports default deny voter', () => {
			expect(authzy.voters.deny()).to.equal(constants.DENY)
		})
		it('exports default abstain voter', () => {
			expect(authzy.voters.abstain()).to.equal(constants.ABSTAIN)
		})
	})
})
