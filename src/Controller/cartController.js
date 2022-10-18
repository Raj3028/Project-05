const cartModel = require('../Model/cartModel')

const productModel = require('../Model/productModel')

const { findOneAndUpdate } = require('../Model/userModel')

const validator = require('../Validator/validator')




//<<<===================== This function is used for Create Cart Data =====================>>>//
const createCart = async (req, res) => {

    try {

        let userId = req.params.userId
        let data = req.body

        //===================== Destructuring Cart Body Data =====================//
        let { cartId, productId, ...rest } = data

        //===================== Checking Field =====================//
        if (!validator.checkInputsPresent(data)) return res.status(400).send({ status: false, message: "No data found from body! You need to put Something(i.e. cartId, productId)." });
        if (validator.checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can input only cartId, productId." }) }

        //===================== Validation of productId =====================//
        if (!validator.isValidBody(productId)) return res.status(400).send({ status: false, message: "Enter ProductId." })
        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: `This ProductId: ${productId} is not valid!` })

        //===================== Fetching Product Data is Present or Not =====================//
        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) { return res.status(404).send({ status: false, message: `This ProductId: ${productId} is not exist!` }) }

        //===================== Assign Value =====================//
        let Price = checkProduct.price
        let quantity = 1

        if (cartId) {

            //===================== Checking the CartId is Valid or Not by Mongoose =====================//
            if (!validator.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: `This cartId: ${cartId} is not valid!.` })

            let checkCart = await cartModel.findOne({ _id: cartId }).select({ _id: 0, items: 1, totalPrice: 1, totalItems: 1 })

            if (checkCart) {

                let items = checkCart.items
                let object = {}

                //===================== Run Loop in items Array =====================//
                for (let i = 0; i < items.length; i++) {

                    //===================== Checking both ProductId are match or not =====================//
                    if (items[i].productId.toString() == productId) {

                        items[i]['quantity'] = (items[i]['quantity']) + quantity
                        let totalPrice = checkCart.totalPrice + (quantity * Price)
                        let totalItem = items.length

                        //===================== Push the Key and Value into Object =====================//
                        object.items = items
                        object.totalPrice = totalPrice
                        object.totalItems = totalItem

                        //===================== Update Cart document =====================//
                        let updateCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: object }, { new: true })

                        return res.status(201).send({ status: true, message: "Success", data: updateCart })

                    }
                }

                //===================== Pushing the Object into items Array =====================//
                items.push({ productId: productId, quantity: quantity })
                let tPrice = checkCart.totalPrice + (quantity * Price)

                //===================== Push the Key and Value into Object =====================//
                object.items = items
                object.totalPrice = tPrice
                object.totalItems = items.length

                //===================== Update Cart document =====================//
                let update1Cart = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: object }, { new: true })

                return res.status(201).send({ status: true, message: "Success", data: update1Cart })

            } else {

                return res.status(404).send({ status: false, message: 'Cart is not exist!' })
            }

        } else {

            //===================== Fetch the Cart Data from DB =====================//
            let cart = await cartModel.findOne({ userId: userId })

            //===================== This condition will run when Card Data is not present =====================//
            if (!cart) {

                //===================== Make a empty Array =====================//
                let arr = []
                let totalPrice = quantity * Price

                //===================== Pushing the Object into items Arr =====================//
                arr.push({ productId: productId, quantity: quantity })

                //===================== Create a object for Create Cart =====================//
                let obj = {
                    userId: userId,
                    items: arr,
                    totalItems: arr.length,
                    totalPrice: totalPrice
                }

                //===================== Final Cart Creation =====================//
                let cart = await cartModel.create(obj)
                // console.log(cart)
                // console.log(Object.keys(cart))
                //console.log("newly created cart with product")

                return res.status(201).send({ status: true, message: "Success", data: cart })

            } else {

                return res.status(400).send({ status: false, message: "Enter your cartID please!" })
            }
        }

    } catch (error) {

        res.status(500).send({ status: false, error: error.message })
    }
}


//===========================================================================================//


const getCart = async (req, res) => {
    try {
        let userId = req.params.userId;

        let carts = await cartModel.findOne({ userId: userId }).populate('items.productId')

        if (!carts) return res.status(404).send({ status: false, message: "cart does not exist!" })

        return res.status(200).send({ status: true, message: 'Success', data: carts })
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}


const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId;

        let cartDelete = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })

        if (!cartDelete) return res.status(404).send({ status: false, message: "cart does not exist!" })

        return res.status(204).send({ status: true, message: "Your cart is empty!" })
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}


//=========================================================================================//

const updateCart = async (req, res) => {
    try {

        
        let data = req.body;
        let { cartId, productId, removeProduct } = data;
        if (removeProduct !== '0' && removeProduct !== '1') { return res.status(400).send({ status: false, message: "RemoveProduct must be 0 or 1!" }) }

        let getProduct = await productModel.findOne({ isDeleted: false, _id: productId })
        if (!getProduct) return res.status(404).send({ status: false, message: "Product not exist!" })


        let getCart = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } })

        if (!getCart) return res.status(404).send({ status: false, message: "Cart does not exist with this product!" })

        let totalAmount = getCart.totalPrice - getProduct.price

        let arr = getCart.items
        let totalItems = getCart.totalItems

        if (removeProduct == 1) {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId.toString() == productId) {
                    arr[i].quantity -= 1
                    if (arr[i].quantity < 1) {
                        totalItems--
                        let update1 = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, totalItems: totalItems }, { new: true })
                        arr = update1.items
                        totalItems = update1.totalItems
                    }
                }
            }

            let updatePrice = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, items: arr, totalItems: totalItems } }, { new: true })
            return res.status(200).send({ status: true, message: "Success", data: updatePrice })
        }

        if (removeProduct == 0) {
            let totalItem = getCart.totalItems - 1
            for (let i = 0; i < arr.length; i++) {
                let prodPrice = getCart.totalPrice - (arr[i].quantity * getProduct.price)
                if (arr[i].productId.toString() == productId) {
                    let update2 = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, totalPrice: prodPrice, totalItems: totalItem }, { new: true })
                    return res.status(200).send({ status: true, message: "Success", data: update2 })
                }
            }
        }





    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }


}

// PUT /users/:userId/cart (Remove product / Reduce a product's quantity from the cart)
// - Updates a cart by either decrementing the quantity of a product by 1 or deleting a product from the cart.
// - Get cart id in request body.
// - Get productId in request body.
// - Get key 'removeProduct' in request body. 
// - Make sure that cart exist.
// - Key 'removeProduct' denotes whether a product is to be removed({removeProduct: 0}) or its quantity has to be decremented by 1({removeProduct: 1}).
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - Get product(s) details in response body.
// - Check if the productId exists and is not deleted before updating the cart.
// - __Response format__
//   - _**On success**_ - Return HTTP status 200. Also return the updated cart document. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)



//===================== Module Export =====================//

module.exports = { createCart, getCart, deleteCart, updateCart }