// const path = require('path');
// const fs = require('fs');
const User = require('../models/user');
const Follow = require('../models/follow');

// la referencia al documento de usuarios me permite hacer el populate y buscar en este documento los id guardados y buscarlos en el otro documento
async function saveFollow(req, res) {
	// recibir el id por formulario del user que vamos a seguir
	const params = req.body;
	// usar el modelo follow
	const follow = new Follow();
	// user el parametro user del esquema y asignarle el valor de usuario loguedo
	follow.user = req.user.sub;
	// uso la propiedad de el modelo y le asigno el id del usuario a seguir
	follow.followed = params.followed;

	try {
		// guardo los datos en la vase
		const followed = follow.save();

		if (!followed) {
			return res.status(404).send({message: 'No se logro seguir a esta persona'});
		}

		res.status(200).send({follow: followed});
	} catch(e) {
		res.status(500).send({message: 'Ocurrio algo raro, intentar más tarde'});
	}
}

async function deleteFollow(req, res) {
	const userId = req.user.sub;
	const followId = req.params.id;

	try {
		// eliminar el registro que tenga el id del usuario logueado y el ido del usurioa seguido que se quiere eliminar
		const delete_follow = await Follow.findOneAndRemove({'user': userId, 'followed': followId});
		if (!delete_follow) {
			return res.status(404).send({message: 'No se pudo eliminar al seguidor'});
		}
		res.status(200).send({message: 'El siguidor se ha eliminado'});
	} catch(e) {
		res.status(500).send({message: 'Ocurrio un error'});
	}
}

async function getFollowingUsers(req, res) {
	let userId = req.user.sub;
	if (req.params.id) {
		userId = req.params.id;
	}

	let page = 1;
	if (req.params.page) {
		page = req.params.page;
	}

	let itemsPerPage = 4;

	const options = {
	  page,
	  limit: itemsPerPage,
	  populate: 'followed'
	};
	try {
		// busco el campo user que es el usuario logueado y el populate uso el followed  que es el id del usuario que sigo
		const follows = await Follow.paginate({user: userId}, options);

		if (!follows) {
			return res.status(404).send({message: 'No se pudo consultar tus seguidores'});
		}
		res.status(200).send({follows});
	} catch(e) {
		res.status(500).send({message: 'Ocurrio un error'});
	}
}

async function getFollowedUsers(req, res) {
	let userId = req.user.sub;
	if (req.params.id) {
		userId = req.params.id;
	}

	let page = 1;
	if (req.params.page) {
		page = req.params.page;
	}

	let itemsPerPage = 4;

	const options = {
	  page,
	  limit: itemsPerPage,
	  populate: 'user'
	}
	try {
		// busco que en campo seguido venga el id del usrio logueado y hago el populate para ver que usuario es el que nos sigue
		const followed = await Follow.paginate({followed: userId}, options);

		if (!followed) {
			return res.status(404).send({message: 'No te sigue ningún usuario'});
		}
		res.status(200).send({followed});
	} catch(e) {
		res.status(500).send({message: 'Ocurrio un error'});
	}
}

async function getMyFollows(req, res) {
	// usuarios que sigo - usuarios que nos siguen
	let userId = req.user.sub;

	try {
		let follow = await Follow.find({user: userId}).populate('user followed').exec();
		if (req.params.followed) {
			follow = await Follow.find({followed: userId}).populate('user followed').exec();
		}
		if (!follow) {
			return res.status(404).send({message: 'No sigues a ningún usuario'});
		}
		res.status(200).send({follow});
	} catch(e) {
		res.status(500).send({message: 'Ocurrio un error'});
	}
}

module.exports = {
	saveFollow,
	deleteFollow,
	getFollowingUsers,
	getFollowedUsers,
	getMyFollows
}
