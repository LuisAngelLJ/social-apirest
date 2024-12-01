const express = require('express');
const PublicationController = require('../controllers/publication');
var api = express.Router();
const md_auth = require('../middlewares/authenticated');
const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir: './uploads/publications'});

// guardar publicación
api.post('/publication', md_auth.ensureAuth, PublicationController.savePublications);
// ver publicaciones de los que sigo, pasar por url pagina opcional
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications);
// ver una publicación, le paso el id de una publicación por url
api.get('/publication/:id', md_auth.ensureAuth, PublicationController.getPublication);
// eliminar una publicación
api.delete('/publication/:id', md_auth.ensureAuth, PublicationController.deletePublication);
// subir imagen, le paso el id de la publicación que se va a actualizar
api.post('/upload-image-publication/:id', [md_auth.ensureAuth, md_upload], PublicationController.uploadImage);
// devolver una imagen
api.get('/get-image-publication/:imageFile', PublicationController.getImageFile);
//devolver las publicaciones del usuario logueado
api.get('/publications-user/:id/:page?', md_auth.ensureAuth, PublicationController.getPublicationsUser);


module.exports = api;
