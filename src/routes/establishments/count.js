import mongoose from "mongoose";

import respond from "../../util/respond.js";

import Establishment from "../../models/establishment.js";

const EstablishmentCount = async (req, res) => {
	if(mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
		try {
			await mongoose.connect(process.env.MONGODB_URI, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			});
		} catch (err) {
			throw err;
		}
	}

	try {
		const found = await Establishment.find().cache(600).countDocuments();

		respond(res, 200, found);
	} catch (err) {
		throw err;
	}
}

export default EstablishmentCount;