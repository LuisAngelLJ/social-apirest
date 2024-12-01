// cargar mongoose
var mongoose = require('mongoose');
// importat app
var app = require('./app');
// puerto
var port = 3800;
// conexión a mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/mean_social')
.then(() => {
	console.log('La conexión a la red social esta hecha');
	// servidor
	app.listen(port, () => {
        console.log("El servidor local esta corriendo http://localhost:3800");
    });
})
.catch(err => {
	console.log(err);
});
// conexión a mongoose
