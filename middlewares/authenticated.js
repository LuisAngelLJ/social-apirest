var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_mean_social';

exports.ensureAuth = function(req, res, next) {
	if (!req.headers.authorization) {
		return res.status(403).send({
			message: 'La petición no tiene autenticación'
		});
	}

	// reemplazar las comillas que trae el string de token por nada
	var token = req.headers.authorization.replace(/['"]+/g, '');

	try {
		var payload = jwt.decode(token, secret);
		// si es una fecha menor a la de ahora
		if (payload.exp <= moment.unix()) {
			return res.status(401).send({
				message: 'El token ha expirado'
			});
		}
	} catch(e) {
		return res.status(404).send({
			message: 'El token no es valido'
		});
	}

	req.user = payload;
	next();
}
