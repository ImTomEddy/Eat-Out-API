const mongoose = require('mongoose');

const Establishment = mongoose.model('Establishment', {
	name: String,
	line1: String,
	line2: String,
	town: String,
	county: String,
	postcode: String,
	location: {
		type: {
			type: String,
			enum: ['Point'],
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	}
});

module.exports = Establishment;