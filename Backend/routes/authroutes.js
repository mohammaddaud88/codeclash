const express = require('express')
const router = express.Router();
const { signUp } = require('../controller/authentication')

router.post('/signup', signUp);


module.exports = router;