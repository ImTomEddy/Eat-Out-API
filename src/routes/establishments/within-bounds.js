import mongoose from "mongoose";
import validate from "validate.js";

import respond from "../../util/respond.js";

import Establishment from "../../models/establishment.js";

const EstablishmentWithinBounds = async (req, res) => {
	if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
		try {
			await mongoose.connect(process.env.MONGODB_URI, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			});
		} catch (err) {
			throw err;
		}
	}

	const validation = validate({
		...req.body
	}, constraints);

	if (validation) return respond(res, 400, validation);

	const latitude = parseFloat(req.body.latitude);
	const longitude = parseFloat(req.body.longitude);
	const latitudeDelta = parseFloat(req.body.latitudeDelta);
	const longitudeDelta = parseFloat(req.body.longitudeDelta);
	const limit = parseInt(req.body.limit);

	const north = Math.ceil((latitude + latitudeDelta) * 100) / 100;
	const south = Math.floor((latitude - latitudeDelta) * 100) / 100;
	const east = Math.ceil((longitude + longitudeDelta) * 100) / 100;
	const west = Math.floor((longitude - longitudeDelta) * 100) / 100;

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
		let found = undefined;

		if (req.body.sample) {
			const aggregate = Establishment.aggregate([{
					$match: {
						location: {
							$geoWithin: {
								$geometry: region
							}
						}
					}
				},
				{
					$sample: {
						size: limit
					}
				},
				{
					$project: {
						location: 1,
						name: 1,
						line1: 1,
						line2: 1,
						town: 1,
						county: 1,
						postcode: 1,
						_id: 1
					}
				}
			]);

			found = await aggregate.cache(600).exec();
		} else {
			found = await Establishment.find({
				location: {
					$geoWithin: {
						$geometry: region
					}
				}
			}).limit(limit).cache(600).select("location name line1 line2 town county postcode _id");
		}

		if (found) {
			const lat = (north + south) / 2;
			const lng = (east + west) / 2;
			const latDelta = Math.round(Math.abs(Math.abs(north) - Math.abs(lat)) * 1000) / 1000
			const lngDelta = Math.round(Math.abs(Math.abs(east) - Math.abs(lng)) * 1000) / 1000

			const message = {
				locations: found,
				bounds: {
					latitude: lat,
					longitude: lng,
					latitudeDelta: latDelta,
					longitudeDelta: lngDelta
				}
			};

			respond(res, 200, message);
		} else {
			throw new Error("Something unknown went wrong");
		}
	} catch (err) {
		throw err;
	}
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
	limit: {
		presence: true,
		numericality: {
			lessThanOrEqualTo: 2500,
			greaterThan: -0
		}
	},
}

export default EstablishmentWithinBounds;