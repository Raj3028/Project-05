const cartModel = require('../Model/cartModel')
const productModel = require('../Model/productModel')
const validator = require('../Validator/validator')



//<<<===================== This function is used for Create Cart Data =====================>>>//
const createCart = async (req, res) => {

    try {

        let userId = req.params.userId
        let data = req.body

        let { cartId, productId } = data
        if(!productId) return res.status(400).send({ status: false, message: "Please Enter productId" })
        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please Enter Valid productId." })

        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) { return res.status(404).send({ status: false, message: `This Product: ${productId} is not exist!` }) }

        let Price = checkProduct.price
        let quantity = 1

        if (cartId) {

            //===================== Checking the CartId is Valid or Not by Mongoose =====================//
            if (!validator.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please Enter Valid cartId." })

            let checkCart = await cartModel.findOne({ _id: cartId }).select({ _id: 0 })
           

            if (checkCart) {

                let items = checkCart.items

                let object = {}

                for (let i = 0; i < items.length; i++) {

                    if (items[i].productId.toString() == productId) {
                        items[i]['quantity'] = (items[i]['quantity']) + 1
                        let totalPrice = checkCart.totalPrice + Price//(items[i]['quantity'] * Price)


                        //let totalItem = items.length
                        object.items = items
                        object.totalPrice = totalPrice
                        object.totalItems = items.length

                        //console.log("checkcart se existing product ")
                        
                        let updateCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: object }, { new: true })
                        return res.status(200).send({ status: true, message: "Success", data: updateCart })
                    }

                }

                items.push({ productId: productId, quantity: 1 })
                totalPrice = checkCart.totalPrice + (Price * quantity)
                object.items = items
                object.totalPrice = totalPrice
                object.totalItems = items.length

                //console.log("new product into cart")
                
                let update1Cart = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: object }, { new: true })
                return res.status(200).send({ status: true, message: "Success", data: update1Cart })


            } else {

                return res.status(404).send({ status: false, message: 'Cart is not exist! You have to create cart first.' })
            }

        } else {

            let cart = await cartModel.findOne({ userId: userId })

            if (!cart) {

                let arr = []
                let totalPrice = quantity * Price

                arr.push({ productId: productId, quantity: 1 })

                let obj = {
                    userId: userId,
                    items: arr,
                    totalItems: arr.length,
                    totalPrice: totalPrice
                }

                let cart = await cartModel.create(obj)
                // console.log(cart)
                // console.log(Object.keys(cart))
                //console.log("newly created cart with product")


                return res.status(201).send({ status: true, message: "Success", data: cart })

            } else {
                return res.status(400).send({ status: false, message: "Enter your cardID please!" })
            }
        }

    } catch (error) {

        res.status(500).send({ status: false, error: error.message })
    }
}


//===================== Module Export =====================//

module.exports = { createCart }