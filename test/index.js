/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect

const authz = require('../')
const Authorizer = require('../lib/Authorizer')
const constants = require('../lib/constants')

describe('authz', () => {
	describe('create', () => {
		it('creates', () => {
			const authorizer = authz()
			expect(authorizer).to.be.an.instanceof(Authorizer)
		})
		it('creates with options', () => {
			const authorizer = authz({foo: 'bar'})
			expect(authorizer).to.have.property('options')
				.that.has.property('foo', 'bar')
		})
		it('passes empty options object to Authorizer', () => {
			const authorizer = authz()
			expect(authorizer).to.have.property('options')
				.that.is.an('object')
		})
	})
	it('exports constants', () => {
		expect(authz.constants).to.equal(constants)
		expect(Object.isFrozen(constants)).to.be.true
	})
})
