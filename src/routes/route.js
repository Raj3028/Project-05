//=====================Importing Module and Packages=====================//
const express = require('express');
const router = express.Router();
const { createUser, userLogin, getUser } = require('../Controller/userController')
const { Authentication, /*Authorisation */ } = require('../MiddleWare/auth')




//===================== User Registration (Post API) =====================//
router.post("/register", createUser)

//===================== User Login (Post API) =====================//
router.post("/login", userLogin)

//===================== Get User Data (Post API) =====================//
router.get("/user/:userId/profile", Authentication, getUser)




//===================== Module Export =====================//
module.exports = router;  