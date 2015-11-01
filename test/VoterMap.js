/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect

const VoterMap = require('../lib/VoterMap')
const constants = require('../lib/constants')

describe('VoterMap', () => {
	let voters
	beforeEach(() => {
		voters = new VoterMap()
	})
	describe('#set', () => {
		it('sets voter into map', () => {
			expect(voters.size).to.equal(0)
			voters.set('foo', () => {})
			expect(voters.size).to.equal(1)
		})
		it('overwrites existing vote', () => {
			voters.set('foo', () => true)
			expect(voters.find('foo')()).to.be.true
			voters.set('foo', () => false)
			expect(voters.find('foo')()).to.be.false
		})
	})
	describe('#find', () => {
		it('returns voter if found in map', () => {
			voters.set('foo', () => true)
			expect(voters.find('foo')).to.exist
		})
		it('returns undefined if not found in map', () => {
			expect(voters.find('blah')).to.be.undefined
		})
	})
	describe('#isEmpty', () => {
		it('returns true if set is empty', () => {
			expect(voters.isEmpty()).to.be.true
		})
		it('returns false if set is not empty', () => {
			voters.set('foo', () => true)
			expect(voters.isEmpty()).to.be.false
		})
	})
	describe('#size', () => {
		it('returns size of set', () => {
			expect(voters.size).to.equal(0)
			voters.set('foo', () => true)
			expect(voters.size).to.equal(1)
		})
	})
	describe('#has', () => {
		it('returns true if a voter is found by name', () => {
			voters.set('foo', () => true)
			expect(voters.has('foo')).to.be.true
		})
		it('returns false if poll not matched in set', () => {
			expect(voters.has('foo')).to.be.false
		})
	})
	describe('#[Symbol.iterator]', () => {
		it('iterates over set values', () => {
			voters.set('foo', () => true)
			const arr = []
			for (const v of voters) {
				arr.push(v)
			}
			expect(arr).to.have.length(1)
		})
	})
	describe('#validateNames', () => {
		it('does not throw error when names exist in map', () => {
			voters.set('foo', () => true)
			voters.set('bar', () => true)
			const fn = voters.validateNames.bind(voters, ['foo', 'bar'])
			expect(fn).to.not.throw
		})
		it('throws error when names exist in map', () => {
			const fn = voters.validateNames.bind(voters, ['foo', 'bar'])
			expect(fn).to.throw(Error, /Voter does not exist: foo, bar/)
		})
	})
	describe('#filter', () => {
		it('returns a filtered map', () => {
			voters.set('foo', () => true)
			voters.set('bar', () => true)
			const filtered = voters.filter(['foo'])
			expect(filtered).to.be.an.instanceof(VoterMap)
			expect(filtered.size).to.equal(1)
			expect(filtered.has('foo')).to.be.true
		})
		it('returns an empty map if empty name array is passed', () => {
			const filtered = voters.filter([])
			expect(filtered.isEmpty()).to.be.true
		})
		it('returns an empty map if non-array is passed', () => {
			const filtered = voters.filter()
			expect(filtered.isEmpty()).to.be.true
		})
	})
	describe('#execute', () => {
		it('resolves votes', () => {
			voters.set('foo', () => constants.ALLOW)
			voters.set('bar', () => constants.ALLOW)

			return voters.execute()
				.reflect()
				.then((i) => {
					expect(i.isFulfilled()).to.be.true
					expect(i.value()).to.have.members([1, 1])
				})
		})
		it('rejects when a voter fails', () => {
			voters.set('foo', () => constants.ALLOW)
			voters.set('bar', () => {
				throw Error('fail')
			})

			return voters.execute()
				.reflect()
				.then((i) => {
					expect(i.isRejected()).to.be.true
					expect(i.reason()).to.have.property('message', 'fail')
				})
		})
	})
})
