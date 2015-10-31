'use strict'

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
	return votes.every((vote) => {
		return vote === constants.ALLOW
	})
}
