const notFoundMiddleware = (req, res, next) => {
	const error = new Error("Resource not found 💸");
	error.statusCode = 404;
	throw error;
}

export default notFoundMiddleware;