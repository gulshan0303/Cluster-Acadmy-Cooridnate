const express = require('express');
const { createSubject } = require('../../controller/master/subject');
const router = express.Router();

router.post("/add",createSubject)



module.exports = router;