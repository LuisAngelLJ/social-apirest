const express = require('express');
const MessageController = require('../controllers/message');
const md_auth = require('../middlewares/authenticated');
let api = express.Router();

// enviar mesange, paso por formulario el mensaje y el id de a quien voy a mandar msj
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
// listar mensajes recibidos
api.get('/my-messages/:page?', md_auth.ensureAuth, MessageController.getReceivedMessages);
// listar mensajes enviados
api.get('/messages/:page?', md_auth.ensureAuth, MessageController.getEmmitMessages);
// contador de mensajes no vistos
api.get('/unviwed-menssages', md_auth.ensureAuth, MessageController.getUnviewedMessages);
// marcar mensajes como vistos
api.get('/set-viewed-messages', md_auth.ensureAuth, MessageController.setViewedMessages);

module.exports = api;
