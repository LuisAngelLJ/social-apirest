var express = require('express');
// usar el controlador
var UserController = require('../controllers/user');
// cargar el router de express
var api = express.Router();

// cargar middleware de autenticación de aqui saco el req.user.sub
var md_auth = require('../middlewares/authenticated');

// cargar la herramienta para subir archivos
const multipart = require('connect-multiparty');
// primero crear la carpeta users manualmente en la que se van a guardar las imagenes
const md_upload = multipart({uploadDir: './uploads/users'});

// definir rutas
// registro
api.post('/register', UserController.saveUser);
// prueba
api.get('/pruebas', md_auth.ensureAuth, UserController.prueba);
// login
api.post('/login', UserController.loginUser);
// buscar usuario y pasar por parametro el id de otro usuario para ver si lo sigo
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
// listar usuarios y el número de pagina opcional
api.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers);
// actualizar usuario
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
// actualizar imagen
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
// devolver imagen
api.get('/get-image-user/:imageFile', UserController.getImageFile);
// contador de seguidores si no le paso un id toma el user logueado, si le paso un id es de otro user
api.get('/counters/:id?', md_auth.ensureAuth, UserController.getCounters);

// exportar
module.exports = api;
