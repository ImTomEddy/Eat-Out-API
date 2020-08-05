const mongoose = require('mongoose');
const Establishment = require('../models/establishment');
const validate = require('validate.js');

module.exports = async (req, res) => {
	res.setHeader('Access-Control-Allow-Credentials', true);
	res.setHeader('Access-Control-Allow-Origin', '*');
	
	console.log(` || process.env.MONGODB_URI || ${process.env.MONGODB_URI} || `);

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

	let {
		north,
		south,
		east,
		west
	} = req.body;
	north = parseFloat(north);
	south = parseFloat(south);
	east = parseFloat(east);
	west = parseFloat(west);

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
	if(error) {
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
const latConstraint = {
	presence: true,
	numericality: {
		lessThanOrEqualTo: 90,
		greaterThanOrEqualTo: -90
	}
};

const longConstraint = {
	presence: true,
	numericality: {
		lessThanOrEqualTo: 180,
		greaterThanOrEqualTo: -180
	}
};

const constraints = {
	north: latConstraint,
	south: latConstraint,
	west: longConstraint,
	east: longConstraint
}