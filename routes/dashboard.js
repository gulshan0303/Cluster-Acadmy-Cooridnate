const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authentication");
const { cacList, countData } = require("../controller/dashboard");


router.get("/cac-list",verifyToken,cacList)
router.get("/counts",verifyToken,countData)

module.exports = router;