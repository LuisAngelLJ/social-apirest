const express = require('express');
const FollowController = require('../controllers/follow');

let api = express.Router();
const md_auth = require('../middlewares/authenticated');

// seguir a otra persona
api.post('/follow', md_auth.ensureAuth, FollowController.saveFollow);
// paso el id de la personq que quiero dejar de seguir
api.delete('/follow/:id', md_auth.ensureAuth, FollowController.deleteFollow);
// ver seguidores de usuario y ver que pagina
api.get('/follows/:id/:page?', md_auth.ensureAuth, FollowController.getFollowingUsers);
// ver quien nos sigue
api.get('/followed/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowedUsers);
// ver mis seguidores - le paso true en followed
api.get('/get-my-follows/:followed?', md_auth.ensureAuth, FollowController.getMyFollows);
module.exports = api;
