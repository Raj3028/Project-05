//=====================Importing Module and Packages=====================//
const express = require('express');
const router = express.Router();
const createUser = require('../Controller/userController')



//===================== (Post API) =====================//
router.post("/register", createUser)




//=====================Module Export=====================//
module.exports = router;  