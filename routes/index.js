const express = require('express');
const router = express.Router();

const SolarController = require('../controller/SolarController');
const ConsumerController = require('../controller/ConsumerController');
const DevController = require('../controller/DevController');

router.post('/solar/calculate', SolarController.calculate);
router.post('/dev', DevController.test);
router.post('/contact', ConsumerController.contactUs);
// router.post('/solar/calculate/schedules', SolarController.calculate);

module.exports = router;