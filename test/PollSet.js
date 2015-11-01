/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect

const PollSet = require('../lib/PollSet')
const Poll = require('../lib/Poll')

describe.only('PollSet', () => {
	let polls
	const poll = new Poll('a', 'b', 'c', ['d'])
	beforeEach(() => {
		polls = new PollSet()
	})
	describe('#add', () => {
		it('adds poll to set', () => {
			expect(polls.set.size).to.equal(0)
			polls.add(poll)
			expect(polls.set.size).to.equal(1)
		})
		it('does not add duplicate poll', () => {
			const duplicate = new Poll('a', 'b', 'c', ['e'])
			polls.add(poll)
			polls.add(duplicate)
			expect(polls.set.size).to.equal(1)
		})
	})
	describe('#find', () => {
		beforeEach(() => {
			polls.add(poll)
		})
		it('returns poll if found in set', () => {
			const result = polls.find(poll.subject, poll.action, poll.resource)
			expect(result).to.be.ok
			expect(result).to.equal(poll)
		})
		it('returns undefined if not found in set', () => {
			expect(polls.find('blah')).to.be.undefined
		})
	})
	describe('#isEmpty', () => {
		it('returns true if set is empty', () => {
			expect(polls.isEmpty()).to.be.true
		})
		it('returns false if set is not empty', () => {
			polls.add(poll)
			expect(polls.isEmpty()).to.be.false
		})
	})
	describe('#size', () => {
		it('returns size of set', () => {
			expect(polls.size).to.equal(0)
			polls.add(poll)
			expect(polls.size).to.equal(1)
		})
	})
	describe('#matches', () => {
		it('returns true if at least one poll is matched in set', () => {
			polls.add(poll)
			expect(polls.matches(poll.subject, poll.action, poll.resource)).to.be.true
		})
		it('returns false if poll not matched in set', () => {
			expect(polls.matches(poll.subject, poll.action, poll.resource)).to.be.false
		})
	})
	describe('#[Symbol.iterator]', () => {
		it('iterates over set values', () => {
			polls.add(poll)
			const arr = []
			for (const p of polls) {
				arr.push(p)
			}
			expect(arr).to.have.length(1)
		})
	})
})
