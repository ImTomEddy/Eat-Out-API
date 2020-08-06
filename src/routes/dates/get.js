import respond from "../../util/respond.js";

const DatesGet = async (req, res) => {
	respond(res, 200, [
		new Date("08/3/2020 GMT"),
		new Date("08/4/2020 GMT"),
		new Date("08/5/2020 GMT"),
		new Date("08/10/2020 GMT"),
		new Date("08/11/2020 GMT"),
		new Date("08/12/2020 GMT"),
		new Date("08/17/2020 GMT"),
		new Date("08/18/2020 GMT"),
		new Date("08/19/2020 GMT"),
		new Date("08/24/2020 GMT"),
		new Date("08/25/2020 GMT"),
		new Date("08/26/2020 GMT"),
		new Date("08/31/2020 GMT"),
	]);
}

export default DatesGet;