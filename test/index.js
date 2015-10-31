/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect

const authz = require('../')
const Authorizer = require('../lib/Authorizer')

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
})
