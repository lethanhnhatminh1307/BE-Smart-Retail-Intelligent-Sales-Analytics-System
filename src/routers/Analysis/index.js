const { test, analyzes } = require('../../App/controllers/Analysis')

const route = require('express').Router()

route.get("/:id", analyzes)

module.exports = route
