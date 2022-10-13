//=====================Importing Module and Packages=====================//
const express = require('express');
const router = express.Router();
const { Authentication, Authorization } = require('../MiddleWare/auth')
const { createUser, userLogin, getUser, updateUserData } = require('../Controller/userController')
const { createProduct, getProduct, getProductById, updateProduct, deleteProduct } = require('../Controller/productController')



//<<<=========================== USER's APIs(FEATURE I) ===========================>>>//

//===================== User Registration (Post API) =====================//
router.post("/register", createUser)
//===================== User Login (Post API) =====================//
router.post("/login", userLogin)
//===================== Get User Data (Get API) =====================//
router.get("/user/:userId/profile", Authentication, getUser)
//===================== Update User Data (Put API) =====================//
router.put("/user/:userId/profile", Authentication, Authorization, updateUserData)
//<<<============================================================================>>>//


//<<<===================== PRODUCT's APIs(FEATURE II) =====================>>>//

//===================== User Registration (Post API) =====================//
router.post("/products", createProduct)
//===================== Get User Data by Query Param(Get API) =====================//
router.get("/products", getProduct)
//===================== Get User Data by Path Param (Get API) =====================//
router.get("/products/:productId", getProductById)
//===================== Get User Data by Path Param (Get API) =====================//
router.put("/products/:productId", updateProduct)
//===================== Get User Data by Path Param (Get API) =====================//
router.delete("/products/:productId", deleteProduct)
//<<<============================================================================>>>//




//===================== Module Export =====================//
module.exports = router;  