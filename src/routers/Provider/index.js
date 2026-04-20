const express = require('express');
const Provider = require('../../App/controllers/Provider');
const routes = express.Router();


routes.get('/show',Provider.show)
routes.post('/create',Provider.create)
routes.post('/update',Provider.change)
routes.delete('/remove',Provider.remove)

module.exports = routes