// cargar mongoose
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
// cargar la herramienta que permite hacer esquemas (modelos- tablas en BD)
var Schema = mongoose.Schema;
// esquema (entidad-modelo)
var MessageSchema = Schema({
	// no hace falta poner el id porque eso lo hace en automatico la BD
	text: String, //mensaje
	viewed: String, //visto o no visto
	created_at: String, //fecha de creación
	emitter: {type: Schema.ObjectId, ref: 'User'}, //quien envia
	receiver: {type: Schema.ObjectId, ref: 'User'} //quien recive
});

MessageSchema.plugin(mongoosePaginate);

// exportar
// se exporta el modelo de mongoose y se define que tabla y la esquema que va a usar
module.exports = mongoose.model('Message', MessageSchema);
// Message -> messages
