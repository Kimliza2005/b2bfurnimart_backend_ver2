const express = require('express');
const router = express.Router();
const { createB2BUser } = require('../controllers/b2bUserController');

router.post('/', createB2BUser);

module.exports = router;
