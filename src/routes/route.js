//=====================Importing Module and Packages=====================//
const express = require('express');
const router = express.Router();
const { Authentication, Authorization } = require('../MiddleWare/auth')
const { createUser, userLogin, getUser, updateUserData } = require('../Controller/userController')




//===================== User Registration (Post API) =====================//
router.post("/register", createUser)

//===================== User Login (Post API) =====================//
router.post("/login", userLogin)

//===================== Get User Data (Get API) =====================//
router.get("/user/:userId/profile", Authentication, getUser)

//===================== Update User Data (Put API) =====================//
router.put("/user/:userId/profile", Authentication, Authorization, updateUserData)




//===================== Module Export =====================//
module.exports = router;  