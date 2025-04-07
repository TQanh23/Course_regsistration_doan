const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/login', authController.getLoginForm);
router.post('/login', authController.login);
router.get('/register', authController.getRegisterForm);
router.post('/register', authController.registerStudent);
router.get('/logout', authController.logout);

module.exports = router;