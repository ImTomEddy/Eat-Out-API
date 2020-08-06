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
	
	try {
		const count = await Establishment.find().count();
		respond(res, 200, count);
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