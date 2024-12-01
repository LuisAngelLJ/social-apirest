// cargar mongoose
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// cargar la herramienta que permite hacer esquemas (modelos- tablas en BD)
var Schema = mongoose.Schema;
// esquema (entidad-modelo)
var PublicationSchema = Schema({
	// no hace falta poner el id porque eso lo hace en automatico la BD
	text: String,
	file: String,
	created_at: String,//fecha
	user: { type: Schema.ObjectId, ref: 'User'} //populate
});

PublicationSchema.plugin(mongoosePaginate);

// exportar
// se exporta el modelo de mongoose y se define que tabla y la esquema que va a usar
module.exports = mongoose.model('Publication', PublicationSchema);
// Publication -> publications
