const express = require('express');
const router = express.Router();
const DashboardController = require('../../App/controllers/Dashboard/DashboardController');

router.get('/summary', DashboardController.getSummary);

module.exports = router;
