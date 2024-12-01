var jwt = require('jwt-simple');
var moment = require('moment');
// clave secreta
var secret = 'clave_secreta_mean_social';

exports.createToken = function(user) {
	// que datos tendra el token
	var payload = {
		sub: user._id,
		name: user.name,
		surname: user.surname,
		nick: user.nick,
		email: user.email,
		rol: user.rol,
		image: user.image,
		iat: moment().unix(),
		exp: moment().add(30, 'days').unix()
	}

	// generar token
	return jwt.encode(payload, secret);
}
