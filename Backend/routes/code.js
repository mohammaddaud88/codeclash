const express = require('express')
const router = express.Router()
const { getProblems, getProblemById, runCode } = require('../controller/coderun')
 
router.get("/", getProblems);
router.get("/:id", getProblemById);
router.post("/submit/:id", runCode);

module.exports = router;