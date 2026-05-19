const express = require('express');
const router = express.Router();
const DashboardController = require('../../App/controllers/Dashboard/DashboardController');

router.get('/summary', DashboardController.getSummary);
router.get('/revenue-chart', DashboardController.getRevenueChart);

module.exports = router;
