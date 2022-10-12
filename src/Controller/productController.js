//===================== Importing Module and Packages =====================//
const productModel = require('../Model/productModel')
const uploadFile = require('../aws/config')
const validator = require('../Validator/validator')




//<<<===================== This function is used for Create Product Data =====================>>>//
const createProduct = async (req, res) => {

    try {

        let data = req.body
        let files = req.files

        //===================== Destructuring User Body Data =====================//
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage, ...rest } = data

        //===================== Checking Mandotory Field =====================//
        if (!validator.checkInputsPresent(data)) return res.status(400).send({ status: false, message: "No data found from body! You need to put the Mandatory Fields (i.e. title, description, price, currencyId, currencyFormat, productImage). " });
        if (validator.checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can input only title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments." }) }


        //===================== Create a Object of Product =====================//
        let obj = {}

        //===================== Validation of title =====================//
        if (!validator.isValidBody(title)) { return res.status(400).send({ status: false, message: "Please enter title!" }) }
        if (!validator.isValidProdName(title)) { return res.status(400).send({ status: false, message: "Please mention valid title In Body!" }) }
        obj.title = title

        //===================== Validation of Description =====================//
        if (!validator.isValidBody(description)) return res.status(400).send({ status: false, message: "Please enter description!" });
        obj.description = description

        //===================== Validation of Price =====================//
        if (!validator.isValidBody(price)) return res.status(400).send({ status: false, message: "Please enter price!" });
        if (!validator.isValidPrice(price)) return res.status(400).send({ status: false, message: "Please valid valid price In Body!" });
        obj.price = price

        //===================== Validation of CurrencyId =====================//
        if (!validator.isValidBody(currencyId)) return res.status(400).send({ status: false, message: "Please enter CurrencyId!" });
        if (currencyId != 'INR') return res.status(400).send({ status: false, message: "CurrencyId must be 'INR'!" });
        obj.currencyId = currencyId

        //===================== Validation of CurrencyFormat =====================//
        if (!validator.isValidBody(currencyFormat)) return res.status(400).send({ status: false, message: "Please enter currencyFormat!" });
        if (currencyFormat != '₹') return res.status(400).send({ status: false, message: "Currency Format must be '₹'!" });
        obj.currencyFormat = currencyFormat

        //===================== Validation of isFreeShipping =====================//
        if (isFreeShipping) {
            if (!validator.isValidBody(isFreeShipping)) return res.status(400).send({ status: false, message: "Please enter value of Free Shipping!" });
            if (isFreeShipping !== 'true') return res.status(400).send({ status: false, message: "Please valid value of Free shipping!" });
            obj.isFreeShipping = true
        }

        //===================== Checking the ProductImage is present or not and Validate the ProductImage =====================//
        if (files && files.length > 0) {
            if (files.length > 1) return res.status(400).send({ status: false, message: "You can't enter more than one file for Create!" })
            let uploadedFileURL = await uploadFile(files[0])
            obj.productImage = uploadedFileURL
        } else {
            return res.status(400).send({ msg: "Product Image is Mandatory! Please input image of the Product." })
        }

        //===================== Validation of Style =====================//
        if (style) {
            if (!validator.isValidBody(style)) return res.status(400).send({ status: false, message: "Please enter style!" });
            if (!validator.isValidName(style)) return res.status(400).send({ status: false, message: "Please valid style!" });
            obj.style = style
        }

        //===================== Validation of AvailableSizes =====================//
        if (!validator.isValidBody(availableSizes)) return res.status(400).send({ status: false, message: "Please enter Size!" });
        availableSizes = availableSizes.split(',').map((item) => item.trim())
        for (let i = 0; i < availableSizes.length; i++) {
            if (!validator.isValidateSize(availableSizes[i])) return res.status(400).send({ status: false, message: "Please mention valid Size!" });
        }
        obj.availableSizes = availableSizes


        //===================== Validation of Installments =====================//
        if (installments) {
            if (!validator.isValidBody(installments)) return res.status(400).send({ status: false, message: "Please enter installments!" });
            if (!validator.isValidInstallment(installments)) return res.status(400).send({ status: false, message: "Provide valid Installments number!" });
            obj.installments = installments
        }

        //===================== Fetching Title of Product from DB and Checking Duplicate Title is Present or Not =====================//
        const isDuplicateTitle = await productModel.findOne({ title: title });
        if (isDuplicateTitle) {
            return res.status(400).send({ status: false, message: "Title is Already Exists, Please Enter Another One Title!" });
        }

        //x===================== Final Creation of Product =====================x//
        let createProduct = await productModel.create(obj)

        res.status(201).send({ status: true, message: "Success", data: createProduct })

    } catch (error) {

        res.status(500).send({ status: false, error: error.message })
    }
}










//===================== Module Export =====================//
module.exports = { createProduct }