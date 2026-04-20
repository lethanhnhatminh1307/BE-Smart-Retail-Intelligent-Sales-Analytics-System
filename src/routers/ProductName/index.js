const express = require('express');
const ProductName = require('../../App/controllers/ProductName');
const routes = express.Router();


routes.get('/show',ProductName.show)
routes.get('/search',ProductName.search)

routes.post('/create',ProductName.create)
routes.post('/update',ProductName.change)
routes.delete('/remove',ProductName.remove)

module.exports = routes