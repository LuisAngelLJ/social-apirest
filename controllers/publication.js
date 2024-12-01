const path = require('path');
const fs = require('fs');
const moment = require('moment');
const Publication = require('../models/publication');
const User = require('../models/user');
const Follow = require('../models/follow');

async function savePublications(req, res) {
	let params = req.body;
	let publication = new Publication();

	if (!params.text) return res.status(403).send({message: 'Debes enviar un texto'});
	publication.text = params.text;
	publication.file = 'null';
	publication.user = req.user.sub;
	publication.created_at = moment().unix();

	try {
		const publicationStored = await publication.save();
		if(!publicationStored) return res.status(404).send({message: 'No se guardo la publicación'});
		res.status(200).send({publication: publicationStored});
	} catch(error) {
		res.status(500).send({message: 'Error al guardar la publicación'});
	}
}

// listar publicaciones de los que me siguen
async function getPublications(req, res) {
	let page = 1;
	if (req.params.page) {
		page = req.params.page;
	}
	const itemsPerPage = 4;

	try {
		// buscar el usuario logueado en la tabla follows y popular los usuarios que siguen a este usuario logueado para listar sus publicaciones
		const follows = await Follow.find({user: req.user.sub}).populate('followed');
		var follows_clean = [];
		follows.forEach(follow => {
			// insertar solo los id de los que nos siguen
			follows_clean.push(follow.followed);
		});

		// añadir nuestras publicaciones al array
		follows_clean.push(req.user.sub);
		// buscar todos los documentos cuyo usuario este en el array followa_clean, ordenado y que también devuelva los datos del user que publico eso
		const options = {
			page,
			limit: itemsPerPage,
			populate: 'user',
			sort: '-created_at'
		}
		//buscar las publicaciones de los id de usuarios que me siguen en el campo user
		Publication.paginate({user: {"$in": follows_clean}}, options)
		.then(publications => {
			if(!publications) return res.status(404).send({message: 'No hay publicaciones'});

			res.status(200).send({publications});
		})
		.catch(error => {
			res.status(500).send({message: 'Error al devolver las publicaciones'});
		});
	} catch(e) {
		// statements
		console.log(e);
	}
}

async function getPublication(req, res) {
	let publicationId = req.params.id;
	try {
		const publication = await Publication.findById(publicationId);
		if(!publication) return res.status(404).send({message: 'No hay publicacion'});

		res.status(200).send({publication});
	} catch(e) {
		res.status(500).send({message: 'Error al devolver la publicacion'});
	}
}

async function deletePublication(req, res) {
	let publicationId = req.params.id;
	try {
		// ver si el id de la publicación esta el id de usuario y despues seleccionar el id de la publicación a eliminar
		const publicationRemoved = await Publication.find({user: req.user.sub, '_id': publicationId}).deleteOne();
		if(!publicationRemoved) return res.status(404).send({message: 'No se elimino la publicación'});

		res.status(200).send({message: 'Publicación eliminada correctamente'});
	} catch(e) {
		res.status(500).send({message: 'Error al eliminar la publicacion'});
	}
}

async function uploadImage(req, res) {
	const publicationId = req.params.id;

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
		// comprobar extención
		if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
			try {
				console.log(req.user.sub);
				// verificar que la publicación es del usuario
				let user_publication = await Publication.findOne({'user': req.user.sub, '_id': publicationId}).exec();
				if (user_publication) {
					// actualizar documento de la publicación
					let publication_updated = await Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new: true});
					if (!publication_updated) {
						return res.status(404).send({message: "No se actualizo la imagen"});
					}

					res.status(200).send({
						user: publication_updated
					});
				} else {
					removeFilesOfUploads(res, file_path, 'No tienes permiso');
				}
			} catch(e) {
				res.status(500).send({message: "Error en la petición"});
			}
		} else {
			// si la extención esta mal eliminar el archivo de la carpeta
			return removeFilesOfUploads(res, file_path, 'La extención no es valida');
		}
	} else {
		return res.status(404).send({message: 'No se han subido las imagenes'});
	}
}

// este es solo una función complementaria para uploadFile, no es para usarlo en las rutas
// no se para que es res, pero si no la pongo me sale error en el return
function removeFilesOfUploads(res, file, message) {
	fs.unlink(file, (error) => {
		return res.status(403).send({message: message});
	});
}
// este es solo una función complementaria para uploadFile, no es para usarlo en las rutas

function getImageFile(req, res) {
	// imageFile es un parametro que se va a recoger por url
	const imageFile = req.params.imageFile;
	// url de las imagenes de usuario
	const path_file = './uploads/publications/'+imageFile;

	fs.exists(path_file, exists => {
		if (exists) {
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(403).send({message: 'No existe la imagen'});
		}
	});
}


// listar publicaciones de el usuario actual
async function getPublicationsUser(req, res) {
	let page = 1;
	let userId = req.user.sub;

	if (req.params.page) {
		page = req.params.page;
	}

	if(req.params.id) {
		userId = req.params.id;
	}

	const itemsPerPage = 4;

	try {
		const options = {
			page,
			limit: itemsPerPage,
			populate: 'user',
			sort: '-created_at'
		}
		// buscar las publicacones donde user sea el id del usuario logueado
		Publication.paginate({user: userId}, options)
		.then(publications => {
			if(!publications) return res.status(404).send({message: 'No hay publicaciones'});

			res.status(200).send({publications});
		})
		.catch(error => {
			res.status(500).send({message: 'Error al devolver las publicaciones'});
		});
	} catch(e) {
		// statements
		console.log(e);
	}
}

module.exports = {
	savePublications,
	getPublications,
	getPublication,
	deletePublication,
	uploadImage,
	getImageFile,
	getPublicationsUser
}
