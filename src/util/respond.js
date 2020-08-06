const respond = (res, status, message, error = false) => {
	const response = {
		status: status
	};

	if(error) {
		response.message = "Error 😞";
		response.error = message;
	} else {
		response.message = message;
	}

	res.status(status);
	res.json(response);
}

export default respond;