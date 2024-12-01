// cargar mongoose
var mongoose = require('mongoose');
// paginción
const mongoosePaginate = require('mongoose-paginate-v2');
// cargar la herramienta que permite hacer esquemas (modelos- tablas en BD)
var Schema = mongoose.Schema;
// esquema (entidad-modelo)
// guardo el id del usuario logueado y el del usuario que se va a seguir con una referecia al otro documento de usuarios
var FollowSchema = Schema({
	// no hace falta poner el id porque eso lo hace en automatico la BD
	user: {type: Schema.ObjectId, ref: 'User'}, //el usuario que sigue
	followed: {type: Schema.ObjectId, ref: 'User'} //usuario seguido
});

FollowSchema.plugin(mongoosePaginate);
// exportar
// se exporta el modelo de mongoose y se define que tabla y la esquema que va a usar
module.exports = mongoose.model('Follow', FollowSchema);
// Follow -> follows
