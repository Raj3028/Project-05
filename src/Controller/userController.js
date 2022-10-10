const userModel = require('../Model/userModel')
const bcrypt = require("bcrypt")
const uploadFile = require('../aws/config')



const createUser = async (req, res) => {

    try {

        let data = req.body
        let files = req.files

        let { fname, lname, email, profileImage, phone, password, address } = data


        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            profileImage = uploadedFileURL
        } else {
            return res.status(400).send({ msg: "No File Found!" })
        }

        password = await bcrypt.hash(password, 10)

        let userCreated = await userModel.create(data)

        res.status(201).send({status: true, message: 'User Created Sucessfully.', data: userCreated})

    } catch (error) {

        res.status(500).send({ status: false, error: error.message })
    }
}



module.exports = createUser