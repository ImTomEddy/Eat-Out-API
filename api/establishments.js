const mongoose = require('mongoose');
const Establishment = require('../models/establishment');
const validate = require('validate.js');

module.exports = async (req, res) => {
	res.setHeader('Access-Control-Allow-Credentials', true);
	res.setHeader('Access-Control-Allow-Origin', '*');

	try {
		await mongoose.connect(process.env.MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
	} catch (err) {
		respond(res, 500, "Error connecting to DB");
	}

	const validation = validate({
		...req.body
	}, constraints);

	if (validation) return respond(res, 400, validation);

	const latitude = parseFloat(req.body.latitude);
	const longitude = parseFloat(req.body.longitude);
	const latitudeDelta = parseFloat(req.body.latitudeDelta);
	const longitudeDelta = parseFloat(req.body.longitudeDelta);

	const north = latitude + latitudeDelta;
	const south = latitude - latitudeDelta;
	const east = longitude + longitudeDelta;
	const west = longitude - longitudeDelta;

	const region = {
		type: 'Polygon',
		coordinates: [
			[
				[west, north],
				[east, north],
				[east, south],
				[west, south],
				[west, north]
			]
		]
	};

	try {
		const found = await Establishment.find({
			location: {
				$geoWithin: {
					$geometry: region
				}
			}
		}).limit(500).select("location name line1 line2 town county postcode _id");

		respond(res, 200, found);
	} catch (err) {
		console.log(err)
		respond(res, 500, err.message);
	}
}

const respond = (res, status, message, error = false) => {
	if (error) {
		message = {
			message: 'Error',
			error: message
		}
	} else {
		message = {
			message: message
		}
	}

	res.status(status).json(message);
	mongoose.connection.close();
}

const constraints = {
	latitude: {
		presence: true,
		numericality: {
			lessThanOrEqualTo: 90,
			greaterThanOrEqualTo: -90
		}
	},
	longitude: {
		presence: true,
		numericality: {
			lessThanOrEqualTo: 180,
			greaterThanOrEqualTo: -180
		}
	},
	latitudeDelta: {
		presence: true,
		numericality: {
			greaterThanOrEqualTo: 0,
			lessThanOrEqualTo: 90
		}
	},
	longitudeDelta: {
		presence: true,
		numericality: {
			greaterThanOrEqualTo: 0,
			lessThanOrEqualTo: 180
		}
	},
}