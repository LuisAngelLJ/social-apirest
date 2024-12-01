// cargar mongoose
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
// cargar la herramienta que permite hacer esquemas (modelos- tablas en BD)
const Schema = mongoose.Schema;
// esquema (entidad-modelo)
const UserSchema = Schema({
	// no hace falta poner el id porque eso lo hace en automatico la BD
	name: String,
	surname: String,
	nick: String,
	email: String,
	password: String,
	role: String,
	image: String
});

UserSchema.plugin(mongoosePaginate);

// exportar
// se exporta el modelo de mongoose y se define que tabla y la esquema que va a usar
module.exports = mongoose.model('User', UserSchema);
// User se convierte en plural y minusculas, si no exite lo crea y si ya lo toma -> user
