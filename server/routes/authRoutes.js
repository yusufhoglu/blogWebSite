const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/signin', authController.getSigninPage);
router.post('/signin', authController.signin);
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);
router.get('/alert', authController.getAlertPage);
router.post('/alert', authController.logout);
router.get('/alert2', authController.getAlert2Page);
router.post('/alert2', authController.redirectToLogin);

module.exports = router; 