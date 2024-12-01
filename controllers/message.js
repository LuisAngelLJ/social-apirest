const moment = require('moment');
const User = require('../models/user');
const Follow = require('../models/follow');
const Message = require('../models/message');

async function saveMessage(req, res) {
	let params = req.body;
	if (!params.text || !params.receiver) {
		return res.status(404).send({message: 'Envia los campos necesarios'});
	}
	let message = new Message();
	message.emitter = req.user.sub;
	message.text = params.text;
	message.receiver = params.receiver;
	message.created_at = moment().unix();
	message.viewed = 'false';
	try {
		const messageStored = await message.save();
		if (!messageStored) return res.status(403).send({message: 'Mensaje no enviado'});
		res.status(200).send({message: messageStored});
	} catch(e) {
		res.status(500).send({message: 'Ocurrio un error'});
	}
}

async function getReceivedMessages(req, res) {
	let userId = req.user.sub;
	let page = 1;
	if (req.params.page) {
		page = req.params.page;
	}
	let itemsPerPage = 4;
	const options = {
		page,
		limit: itemsPerPage,
		populate: {
			path: 'emitter',
			select: 'name surname image nick _id'
		}
	}

	try {
		const messages = await Message.paginate({receiver: userId}, options);
		if (!messages) {
			return res.status(404).send({message: 'No se pudo consultar tus mensajes'});
		}
		res.status(200).send({messages});
	} catch(e) {
		res.status(500).send({message: 'Ocurrio un error'});
	}
}

async function getEmmitMessages(req, res) {
	let userId = req.user.sub;
	let page = 1;
	if (req.params.page) {
		page = req.params.page;
	}
	let itemsPerPage = 4;
	const options = {
		page,
		limit: itemsPerPage,
		populate: {
			path: 'receiver emitter',
			select: 'name surname image nick _id'
		}
	}

	try {
		const messages = await Message.paginate({emitter: userId}, options);
		if (!messages) {
			return res.status(404).send({message: 'No se pudo consultar tus mensajes'});
		}
		res.status(200).send({messages});
	} catch(e) {
		res.status(500).send({message: 'Ocurrio un error'});
	}
}

async function getUnviewedMessages(req, res) {
	let userId = req.user.sub;
	try {
		let message_viewed = await Message.count({receiver: userId, viewed: 'false'});
		res.status(200).send({'unviwed': message_viewed});
	} catch(e) {
		res.status(500).send({message: 'Ocurrio un error'});
	}
}

async function setViewedMessages(req, res) {
	let userId = req.user.sub;
	try {
		// busqueda - lo que se va a actualizar - opciones(actualizar todos los documentos)
		const viewed = await Message.updateOne({receiver: userId, viewed: 'false'}, {viewed: 'true'}, {"multi": true});
		res.status(200).send({messages: viewed});
	} catch(e) {
		res.status(500).send({message: 'Ocurrio un error'});
	}
}

module.exports = {
	saveMessage,
	getReceivedMessages,
	getEmmitMessages,
	getUnviewedMessages,
	setViewedMessages
}
