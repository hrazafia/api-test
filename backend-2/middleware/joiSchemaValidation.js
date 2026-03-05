const constants = require('../constants');

const validateObjectSchema = (data, schema) => {
	const { error, value } = schema.validate(data, {
		abortEarly: false,
		stripUnknown: false,
		convert: false
	});

	return { error, value };
}

module.exports.validateBody = (schema) => {
	return (req, res, next) => {
		let response = { ...constants.defaultServerResponse };
		
		const { error, value } = validateObjectSchema(req.body, schema);
		
		if (error)
		{
			response.body = error;
			response.message = constants.requestValidationMessage.BAD_REQUEST;
			return res.status(response.status).send(response);
		}
		req.body = value;
		next();
	};
};

module.exports.validateQueryParams = (schema) => {
	return (req, res, next) => {
		let response = { ...constants.defaultServerResponse };
		
		const { error, value } = validateObjectSchema(req.query, schema);
		
		if (error)
		{
			response.body = error;
			response.message = constants.requestValidationMessage.BAD_REQUEST;
			return res.status(response.status).send(response);
		}
		req.body = value;
		next();
	};
};
