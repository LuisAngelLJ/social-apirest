// importar el modelo
const User = require('../models/user');
const Follow = require('../models/follow');
const Publication = require('../models/publication');
// importar el encriptador de contraseñas
const bcrypt = require('bcrypt-nodejs');
// función para generar token
const jwt = require('../services/jwt');
// file system de node que permite trabajar con archivos
const fs = require('fs');
// permite trabajar con rutas de archivos
const path = require('path');

// metodos que tienen la logica de cada ruta
async function saveUser(req, res) {
	// datos que llegan del formulario
	let params = req.body;
	// usar el modelo
	let user = new User();

	// validación de datos llenos
	if (params.name && params.surname && params.nick && params.email && params.password) {
		user.name = params.name;
		user.surname = params.surname;
		user.nick = params.nick;
		user.email = params.email;
		user.role = 'ROLE_USER';
		user.image = null;

		//evitar duplicados
		let users = await User.find(
			// condición como similar al if, si existe email y nick
			{ $or: [
				{email: user.email.toLowerCase()},
				{nick: user.nick.toLowerCase()}
			]}
		).exec();

		try {
			if (users && users.length >= 1) {
				res.status(200).send({message: 'El usuario ya existe'});
			} else { //si no existe un usuario igual
				// cifar contraseña
				bcrypt.hash(params.password, null, null, (err, hash) => {
					user.password = hash;

					// guardar el usuario
					user.save()
					.then(userStored => {
						if (userStored) {
							res.status(200).send({user: userStored});
						} else {
							res.status(404).send({message: "No se ha podido registrar el usuario"});
						}
					})
					.catch(err => {
						res.status(500).send({message: 'Error al guardar el usuario'});
					});
				});
			}
		} catch(e) {
			res.status(500).send({
				message: 'Error en el usuario'
			});
		}
		//evitar duplicados
	} else {
		res.status(500).send({
			message: "Ingresar todos los datos"
		});
	}
}

async function loginUser(req, res) {
	// datos que llegan del formulario
	let params = req.body;

	let email = params.email;
	let password = params.password;

	// consultar los datos en la BD - where
	const user_login = await User.findOne({email: email});

	try {
		if (user_login) {
			bcrypt.compare(password, user_login.password, (err, check) => {
				if (check) {
					// devolver datos de usuario
						//token
					if (params.gettoken) { //este parametro lo creo en el formulario y su valor lo tengo que poner a true
						// generar y devolver token
						// generar token
						return res.status(200).send({
							token: jwt.createToken(user_login)
						});
					} else {
						user_login.password = '';
						res.status(200).send({user: user_login});
					}

				} else {
					res.status(404).send({message: "Error al identificar"});
				}
			});
		} else {
			res.status(404).send({message: "El usuario no se ha podido identificar"});
		}
	} catch(e) {
		res.status(500).send({message: "Error en la petición"});
	}

}

async function getUser(req, res) {
	// si llegan datos por url se usa params, si es por formularios se usa body
	const userId = req.params.id;
	// console.log("usuario consultado "+userId);

	try {
		// usar modelo y buscar el registro por id
		const user = await User.findById(userId);
		if(!user) {
			return res.status(404).send({message: "No se encontro al usuario"});
		}
		// comprobar nuestro usuario sigue al seguidor que llega por url
		followThisUser(req.user.sub, userId).then(value => {
			user.password = undefined;
			let meSigue = value[0];
			let loSigo = value[1];
			res.status(200).send({user, following: meSigue, followed: loSigo});
		});

	} catch(e) {
		res.status(500).send({message: "Error en la consulta"});
	}
}

// función complementaria a getUser
async function followThisUser(session_user, consult_user) {
	// requiero que se ejecute todo al mismo tiempo porque si uno es null se detiene y no hace la segunda consulta
	const promiseFollow = [];
	// me sigue?
	promiseFollow.push(Follow.findOne({$and: [{"user": consult_user}, {"followed": session_user}]}).exec());
	// lo sigo?
	promiseFollow.push(Follow.findOne({$and: [{"user": session_user}, {"followed": consult_user}]}).exec());

	try {
		const result = await Promise.all(promiseFollow);
		return result;
	} catch(e) {
		console.log(e);
	}
}
// función complementaria a getUser

async function getUsers(req, res) {
	// id de usuario logeado de jwt
	let identiy_user_id = req.user.sub;
	let page = 1;
	// parametro de pagina
	if (req.params.page) {
		page = req.params.page;
	}
	// cantidad de usuarios que se mostraran por página
	let itemsPerPage = 5;

	const options = {
	  page,
	  limit: itemsPerPage,
	  sort: {
	    _id: 1
	  }
	};

	// listar usuarios y ordenar
	try {
		// listar los usuarios menos el usuario logueado
		const users = await User.paginate({_id: { "$ne": identiy_user_id }}, options);
			if (!users) {
				return res.status(404).send({message: "No hay usaurios disponibles"});
			}
			// uso la funcion oara buscar a los que sigo y me siguen pasando mi id
			followUserIds(identiy_user_id).then(value => {
				// devuelvo un array con los id que me siguien y otro con los id que sigo y por ultimo devuelvo de forma normal a todos los usuarios
				res.status(200).send({users, following: value.following, followed: value.followed});
			});
	} catch(e) {
		res.status(500).send({message: 'Error en la consulta'});
	}
}

// función complementaria a getUsers - es una consulta a los docs de la tabla follow
async function followUserIds(user_id) {
	try {
		// siguiendo buscar mi id en ls propiedad user que es el que sigue y elimino los siguientes campos
		var following = await Follow.find({"user": user_id}).select({'_id': 0, '__v': 0, 'user': 0});
	} catch(e) {
		console.log(e);
	}

	let following_clean = [];
	for(let follow of following){
		following_clean.push(JSON.stringify(follow.followed));
	}

	try {
		// seguidores buscar mi id en la rpopiedad followed que es que me siguen y elimino los siguientes campos
		var followed = await Follow.find({"followed": user_id}).select({'_id': 0, '__v': 0, 'followed': 0});
	} catch(e) {
		console.log(e);
	}

	let followed_clean = [];
	followed.forEach(follow => {
		followed_clean.push(follow.user);
	});

	return {
		following,
		followed
	}
}
// función complementaria a getUsers

async function updateUser(req, res) {
	const userId = req.params.id;
	// los nuevos datos
	const update = req.body;
	// borrar la propiedad de contraseña
	delete update.password;
	// console.log(req.user.sub);
	// console.log(update.nick);
	// comparo el id que llega con el que esta en sesión en el archivo jwt
	if (userId !== req.user.sub) {
		return res.status(403).send({message: 'No tienes permiso para actualizar los datos del usuario'});
	}

	try {
		// consultar el email y el nick
		let resgiterExist = await User.findOne({$or: [
			{email: update.email.toLowerCase()},
			{nick: update.nick.toLowerCase()}
		]}).exec();
		// no actulizar si el nick e imail es de otro usuario
		if (update._id != resgiterExist._id && update.nick == resgiterExist.nick) {
			return res.status(404).send({message: 'El nick es el mismo'});
		}
		if (update._id != resgiterExist._id && update.email == resgiterExist.email) {
			return res.status(404).send({message: 'El email es igual'});
		}

		let user_update = await User.findByIdAndUpdate(userId, update, {new: true});
		if (!user_update) {
			return res.status(404).send({message: "No se encontro el usuario"});
		}

		res.status(200).send({
			user: user_update
		});
	} catch(e) {
		res.status(500).send({message: "Error en la petición"});
	}
}

async function uploadImage(req, res) {
	const userId = req.params.id;

	if(req.files) {
		let file_path = req.files.image.path;
		// separar la url del archivo
		let file_split = file_path.split('\\');
		// seleccionar solo el nombre del archivo
		const file_name = file_split[2];
		// sacar la extención de el archivo
		const ext_split = file_name.split('\.');
		// extención de archivo
		const file_ext = ext_split[1].toLowerCase();
		// comparo el id que llega con el que esta en sesión en el archivo jwt
		if (userId !== req.user.sub) {
			return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar la imagen');
		}
		// comprobar extención
		if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
			// actualizar documento del usuario logueado
			try {
				let update_file = await User.findByIdAndUpdate(userId, {image: file_name}, {new: true});
				if (!update_file) {
					return res.status(404).send({
						message: "No se actualizo la imagen"
					});
				}

				res.status(200).send({
					user: update_file
				});
			} catch(e) {
				res.status(500).send({
					message: "Error en la petición"
				});
			}
		} else {
			// si la extención esta mal eliminar el archivo de la carpeta
			return removeFilesOfUploads(res, file_path, 'La extención no es valida');
		}
	} else {
		return res.status(404).send({message: 'No se han subido las imagenes'});
	}
}

// este es solo una función complementaria, no es para usarlo en las rutas
// no se para que es res, pero si no la pongo me sale error en el return
function removeFilesOfUploads(res, file, message) {
	fs.unlink(file, (error) => {
		return res.status(403).send({message: message});
	});
}

function getImageFile(req, res) {
	// imageFile es un parametro que se va a recoger por url
	const imageFile = req.params.imageFile;
	// url de las imagenes de usuario
	const path_file = './uploads/users/'+imageFile;

	fs.exists(path_file, exists => {
		if (exists) {
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(403).send({message: 'No existe la imagen'});
		}
	});
}

function getCounters(req, res) {
	// usuario logueado
	var userId = req.user.sub;
	if (req.params.id) {
		// id de otro usuario
		userId = req.params.id;
	}
	getCountFollow(userId).then(value => {
		res.status(200).send(value);
	});
}

// función para getCounters
async function getCountFollow(user_id) {
	try {
		var following = await Follow.count({"user": user_id});
		!following ? 'No sigues a nadie': following;
	} catch(e) {
		console.log(e);
	}

	try {
		var followed = await Follow.count({"followed": user_id});
		!followed ? 'No te sigue nadie': followed;
	} catch(e) {
		console.log(e);
	}

	// contador de publicaciones
	try {
		var publications = await Publication.count({"user": user_id});
		!publications ? 'No tienes publicaciones': publications;
	} catch(e) {
		console.log(e);
	}

	return {
		following,
		followed,
		publications
	}
}
// función para getCounters

function prueba(req, res) {
	res.status(200).send({
		message: "Prueba"
	});
}
// metodos que tienen la logica de cada ruta

// eportar
module.exports = {
	saveUser,
	prueba,
	loginUser,
	getUser,
	getUsers,
	updateUser,
	uploadImage,
	getImageFile,
	getCounters
}
