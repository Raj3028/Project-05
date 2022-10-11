//=====================Importing Module and Packages=====================//
const express = require('express');
const router = express.Router();
const { createUser, userLogin } = require('../Controller/userController')



//===================== User Registration(Post API) =====================//
router.post("/register", createUser)

//===================== User Login(Post API) =====================//
router.post("/login", userLogin)



//=====================Module Export=====================//
module.exports = router;  