'use strict'

const constants = require('../lib/constants')

exports.affirmative = (votes) => {
	return votes.some((vote) => {
		return vote === constants.ALLOW
	})
}
