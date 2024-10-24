const express = require("express");
const router = express.Router();


// const {verifyToken,isAdmin} = require("../middleware/authentication");
const { registerUser, loginUser, deleteUser, updateUser,getSingleUser, getAllUsers } = require("../controller/user");
const { verifyToken } = require("../middleware/authentication");





router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/deleteUser", deleteUser)
router.post("/updateUser", updateUser)
router.post("/getAllUser", getAllUsers)
router.post("/getSingleUser",verifyToken, getSingleUser)

module.exports = router;