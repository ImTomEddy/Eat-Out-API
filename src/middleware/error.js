import respond from "../util/respond.js";
import {
	writeFile
} from "fs";
import path from "path";

const errorMiddleware = (err, req, res, next) => {
	if (!err.statusCode) err.statusCode = 500;
	respond(res, err.statusCode, err.message, true);

	if (err.statusCode !== 404) {
		writeFile(path.join(path.resolve(), "logs", `${new Date().getTime()}-${err.statusCode}.log.json`),
			JSON.stringify({
				message: err.message,
				statusCode: err.statusCode,
				stack: err.stack,
				body: req.body,
				headers: req.headers,
				error: err.toString()
			}), () => {});
	}
}

export default errorMiddleware;