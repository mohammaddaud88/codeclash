const express = require('express')
const router = express.Router()
const  runCode  = require('../controller/coderun')
 
router.post("/run", runCode);
module.exports = router;