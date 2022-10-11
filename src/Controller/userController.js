//===================== Importing Module and Packages =====================//
const userModel = require('../Model/userModel')
const bcrypt = require("bcrypt")
const JWT = require('jsonwebtoken')
const uploadFile = require('../aws/config')
const validator = require('../Validator/validator')



//<<<===================== This function is used for Create User =====================>>>//
const createUser = async (req, res) => {

    try {

        let data = req.body
        let files = req.files

        //===================== Destructuring User Body Data =====================//
        let { fname, lname, email, profileImage, phone, password, address, ...rest } = data

        //===================== Checking Mandotory Field =====================//
        if (!validator.checkInputsPresent(data)) return res.status(400).send({ status: false, message: "No data found from body!" });
        if (validator.checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can input only fname, lname, email, profileImage, phone, password & address." }) }


        if (!address || address == '') return res.status(400).send({ status: false, message: "Please give the User Address." })

        //===================== Convert from JSON String to JSON Object of Address =====================//
        address = JSON.parse(address)

        //===================== Destructuring Address Object Data =====================//
        let { shipping, billing } = address


        //===================== Destructuring User Body Data =====================//
        if (!validator.isValidBody(fname)) { return res.status(400).send({ status: false, message: 'Please enter fname' }) }
        if (!validator.isValidName(fname)) { return res.status(400).send({ status: false, message: 'fname should be in Alphabets' }) }

        if (!validator.isValidBody(lname)) { return res.status(400).send({ status: false, message: 'Please enter lname' }) }
        if (!validator.isValidName(lname)) { return res.status(400).send({ status: false, message: 'lname should be in Alphabets' }) }

        if (!validator.isValidBody(email)) { return res.status(400).send({ status: false, message: 'Please enter the Email Id' }) }
        if (!validator.isValidEmail(email)) { return res.status(400).send({ status: false, message: 'Please enter valid emailId' }) }

        if (!validator.isValidBody(phone)) { return res.status(400).send({ status: false, message: 'Please enter the Mobile Number' }) }
        if (!validator.isValidMobileNumber(phone)) { return res.status(400).send({ status: false, message: 'Please enter valid Mobile Number' }) }

        if (!validator.isValidBody(password)) { return res.status(400).send({ status: false, message: 'Please enter the password' }) }
        if (!validator.isValidpassword(password)) { return res.status(400).send({ status: false, message: "password should be have minimum 8 character and max 15 character" }) }


        //===================== Validation of Shipping Address =====================//
        if (!shipping) return res.status(400).send({ status: false, message: "Enter Shipping Address." })

        if (!validator.isValidBody(shipping.street)) { return res.status(400).send({ status: false, message: 'Please enter Shipping street' }) }

        if (!validator.isValidBody(shipping.city)) { return res.status(400).send({ status: false, message: 'Please enter Shipping city' }) }
        if (!validator.isValidCity(shipping.city)) { return res.status(400).send({ status: false, message: 'Invalid Shipping city' }) }

        if (!validator.isValidBody(shipping.pincode)) { return res.status(400).send({ status: false, message: 'Please enter Shipping pin' }) }
        if (!validator.isValidPin(shipping.pincode)) { return res.status(400).send({ status: false, message: 'Invalid Shipping Pin Code.' }) }


        //===================== Validation of Billing Address =====================//
        if (!billing) return res.status(400).send({ status: false, message: "Enter Billing Address." })

        if (!validator.isValidBody(billing.street)) { return res.status(400).send({ status: false, message: 'Please enter billing street' }) }

        if (!validator.isValidBody(billing.city)) { return res.status(400).send({ status: false, message: 'Please enter billing city' }) }
        if (!validator.isValidCity(billing.city)) { return res.status(400).send({ status: false, message: 'Invalid billing city' }) }

        if (!validator.isValidBody(billing.pincode)) { return res.status(400).send({ status: false, message: 'Please enter billing pin' }) }
        if (!validator.isValidPin(billing.pincode)) { return res.status(400).send({ status: false, message: 'Invalid billing Pin Code.' }) }


        //===================== Checking the File is present or not and Create S3 Link =====================//
        if (files && files.length > 0) {
            var uploadedFileURL = await uploadFile(files[0])
        }
        else {
            return res.status(400).send({ msg: "Please put image to create registration!" })
        }

        //===================== Encrept the password by thye help of Bcrypt =====================//
        const saltRounds = 10
        password = await bcrypt.hash(password, saltRounds)


        //=====================Fetching data of Email from DB and Checking Duplicate Email or Phone is Present or Not=====================//
        const isDuplicateEmail = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] })
        if (isDuplicateEmail) {
            if (isDuplicateEmail.email == email) { return res.status(400).send({ status: false, message: `This EmailId: ${email} is already exist!` }) }
            if (isDuplicateEmail.phone == phone) { return res.status(400).send({ status: false, message: `This Phone No.: ${phone} is already exist!` }) }
        }


        //===================== Create a Object of User =====================//
        let obj = {
            fname: fname,
            lname: lname,
            email: email,
            phone: phone,
            password: password,
            profileImage: uploadedFileURL
        }

        obj["address.shipping.street"] = shipping.street
        obj["address.shipping.city"] = shipping.city
        obj["address.shipping.pincode"] = shipping.pincode
        obj["address.billing.street"] = billing.street
        obj["address.billing.city"] = billing.city
        obj["address.billing.pincode"] = billing.pincode

        //x===================== Final Creation of User =====================x//
        let userCreated = await userModel.create(obj)

        res.status(201).send({ status: true, message: "User created successfully", data: userCreated })

    } catch (error) {

        res.status(500).send({ status: false, error: error.message })
    }
}



//<<<===================== This function is used for Login the User =====================>>>//

const userLogin = async function (req, res) {

    try {

        let data = req.body
        let { email, password, ...rest } = data

        //=====================Checking User input is Present or Not =====================//
        if (!validator.checkInputsPresent(data)) return res.status(400).send({ status: false, message: "You have to input email and password." });
        if (validator.checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can input only email and password." }) }

        //=====================Checking Format of Email & Password by the help of Regex=====================//
        if (!validator.isValidBody(email)) return res.status(400).send({ status: false, message: "EmailId required to login" })
        if (!validator.isValidEmail(email)) { return res.status(400).send({ status: false, message: "Invalid EmailID Format or Please input all letters in lowercase." }) }

        if (!validator.isValidBody(password)) return res.status(400).send({ status: false, message: "Password required to login" })
        if (!validator.isValidpassword(password)) { return res.status(400).send({ status: false, message: "Re-enter your Correct Password." }) }


        //===================== Fetch Data from DB =====================//
        const userData = await userModel.findOne({ email: email })
        if (!userData) { return res.status(401).send({ status: false, message: "Invalid Login Credentials! You need to register first." }) }

        //===================== Decrypt the Password and Compare the password with User input =====================//
        let checkPassword = await bcrypt.compare(password, userData.password)
       
        if (checkPassword) {

            let payload = {
                userId: userData._id.toString(),
                Room: '21',
                Batch: 'Plutonium',
                Project: "Products Management",
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 60 * 60
            }

            const token = JWT.sign({ payload }, "We-are-from-Group-21", { expiresIn: 60 * 60 });

            //x=====================Set Key with value in Response Header=====================x//
            res.setHeader("x-api-key", token)

            //=====================Create a Object for Response=====================//
            let obj = { userId: userData._id, token: token }


            return res.status(200).send({ status: true, message: 'User login successfull', data: obj })

        } else {

            return res.status(400).send({ status: false, message: 'Wrong Password' })
        }

    } catch (error) {

        res.status(500).send({ status: false, error: error.message })
    }
}












//=====================Module Export=====================//
module.exports = { createUser, userLogin }