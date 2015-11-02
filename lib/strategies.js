'use strict'

const P = require('bluebird')

const constants = require('../lib/constants')

exports.affirmative = (votes) => {
	return votes.some((vote) => {
		return vote === constants.ALLOW
	})
}

exports.consensus = (votes) => {
	const allow = votes.filter((vote) => {
		return vote === constants.ALLOW
	}).length
	const deny = votes.filter((vote) => {
		return vote === constants.DENY
	}).length

	if (allow === 0 && deny === 0) {
		return false
	}
	return allow >= deny
}

exports.unanimous = (votes) => {
	const someDeny = votes.some((vote) => {
		return vote === constants.DENY
	})
	const someAllow = votes.some((vote) => {
		return vote === constants.ALLOW
	})

	if (someDeny) {
		return false
	}

	if (someAllow) {
		return true
	}

	// All abstain
	return false
}

exports.execute = (strategy, votes) => {
	switch (strategy) {
		case constants.AFFIRMATIVE:
			return P.resolve(exports.affirmative(votes))
		case constants.CONSENSUS:
			return P.resolve(exports.consensus(votes))
		case constants.UNANIMOUS:
			return P.resolve(exports.unanimous(votes))
		default:
			return P.resolve(false)
	}
}
