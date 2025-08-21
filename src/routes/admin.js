const express = require('express');
const router = express.Router();
const { createB2BUserByAdmin, getUsersByAdmin, getOrdersByUid, UpdateRoleByAdmin } = require('../controllers/admin');
const verifyAdmin = require('../middleware/verifyAdmin');

router.post('/b2b/create', verifyAdmin, createB2BUserByAdmin);

module.exports = router;