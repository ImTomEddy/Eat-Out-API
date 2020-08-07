import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cachegoose from "cachegoose";
import cors from "cors";

import errorMiddleware from "./middleware/error.js";
import notFoundMiddleware from "./middleware/not-found.js";

import EstablishmentWithinBounds from "./routes/establishments/within-bounds.js";
import EstablishmentCount from "./routes/establishments/count.js";
import DatesGet from "./routes/dates/get.js";

async function setup() {
	dotenv.config();

	if (!process.env.MONGODB_URI) console.log('No MONGO URI.');

	try {
		console.log('Connecting to MongoDB');
		await mongoose.connect(process.env.MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		console.log('Connected to MongoDB');
		
		cachegoose(mongoose, {
			engine: 'redis',
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT,
			password: process.env.REDIS_PASS
		});
	} catch (err) {
		console.log(err);
		return await new Promise((resolve) => setTimeout(() => {
			setup();
			resolve();
		}, 1000));
	}

	const app = express();
	const port = process.env.PORT || 3080;

	app.use(bodyParser.json({
		limit: "1mb"
	}));

	app.use(bodyParser.urlencoded({
		limit: "1mb",
		extended: false
	}));

	app.use(cors());

	app.use(morgan("dev"));

	app.post('/api/establishments/within-bounds', EstablishmentWithinBounds);
	app.get('/api/establishments/count', EstablishmentCount);
	app.get('/api/dates', DatesGet);
	
	
	// Keep Blow Routes
	app.use(notFoundMiddleware);
	app.use(errorMiddleware);

	console.log(`Starting to listen on port ${port}.`);
	app.listen(port, async (err) => {
		if (err) {
			console.log(err);
			return await new Promise((resolve) => setTimeout(() => {
				setup();
				resolve();
			}, 1000));
		}
		console.log(`Started listening on port ${port}.`);
		console.log(`Switching to better logging.`);
	});
}

setup();