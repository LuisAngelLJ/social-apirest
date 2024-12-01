// cargar express
const express = require('express');
// inatanciar express
var app = express();

// cargar rutas
const user_routes = require('./routes/user');
const follow_routes = require('./routes/follow');
const publication_routes = require('./routes/publication');
const message_routes = require('./routes/message');

//middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// cors- configurar cabeceras http
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});

// rutas
app.get('/', (req, res) => {
	res.status(200).send({
		message: "Hola mundo!"
	});
});

// sobreescriben rutas
app.use('/', user_routes);
app.use('/', follow_routes);
app.use('/', publication_routes);
app.use('/', message_routes);

// exportar
module.exports = app;
