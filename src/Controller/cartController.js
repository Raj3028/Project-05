//===================== Importing Module and Packages =====================//
const cartModel = require('../Model/cartModel')
const productModel = require('../Model/productModel')
const validator = require('../Validator/validator')




//<<<===================== This function is used for Create Cart Data =====================>>>//
const createCart = async (req, res) => {

    try {

        let userId = req.params.userId
        let data = req.body

        //===================== Destructuring Cart Body Data =====================//
        let { cartId, productId, quantity, ...rest } = data


        if (!quantity) { quantity = 1 }
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
        // let quantity = 1

        if (cartId) {

            //===================== Checking the CartId is Valid or Not by Mongoose =====================//
            if (!validator.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: `This cartId: ${cartId} is not valid!.` })

            //===================== Fetch the Cart Data from DB =====================//
            let checkCart = await cartModel.findOne({ _id: cartId, userId: userId }).select({ _id: 0, items: 1, totalPrice: 1, totalItems: 1 })

            //===================== This condition will run when Card Data is present =====================//
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

                return res.status(201).send({ status: true, message: "Success", data: cart })

            } else {

                return res.status(400).send({ status: false, message: "Enter your cartID please!" })
            }
        }

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}


//<<<===================== This function is used for Update Cart Data =====================>>>//
const updateCart = async (req, res) => {

    try {

        let data = req.body;
        let userId = req.params.userId

        //===================== Destructuring Cart Body Data =====================//
        let { cartId, productId, removeProduct } = data;

        //===================== Checking the RemoveProduct Value =====================//
        if (!validator.isValidBody(removeProduct)) { return res.status(400).send({ status: false, message: "RemoveProduct is Mandatory." }) }
        if (removeProduct != 0 && removeProduct != 1) { return res.status(400).send({ status: false, message: "RemoveProduct must be 0 or 1!" }) }

        //===================== Validation for CartID =====================//
        if (!cartId) return res.status(400).send({ status: false, message: "Please Enter CartId" })
        if (!validator.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please Enter Valid Cart Id" })

        //===================== Validation for ProductID =====================//
        if (!productId) return res.status(400).send({ status: false, message: "Please Enter productId" })
        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please Enter Valid productId" })

        //===================== Fetch the Product Data From DB =====================//
        let getProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!getProduct) return res.status(404).send({ status: false, message: "Product not exist!" })

        //===================== Fetch the Cart Data From DB =====================//
        let getCart = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } })
        if (!getCart) return res.status(404).send({ status: false, message: "You have no cart with your userId or In your cart doesn't have this Product." })


        //===================== Set the Total Amount =====================//
        let totalAmount = getCart.totalPrice - getProduct.price

        //===================== Store the Item Array inside arr variable =====================//
        let arr = getCart.items
        let totalItems = getCart.totalItems

        //===================== Condition for RemoveProduct value as 1 =====================//
        if (removeProduct == 1) {

            //===================== loop for arr =====================//
            for (let i = 0; i < arr.length; i++) {

                //===================== Condition for checking those two Product is matched or not =====================//
                if (arr[i].productId.toString() == productId) {
                    arr[i].quantity -= 1

                    //===================== Condition for checking the Product Quantity is 0 or not =====================//
                    if (arr[i].quantity < 1) {

                        totalItems--

                        //===================== Pull that Product from that cart and Update values =====================//
                        let update1 = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, totalItems: totalItems }, { new: true })

                        //===================== Fetch item and total item and set in Variable =====================//
                        arr = update1.items
                        totalItems = update1.totalItems
                    }
                }
            }

            //===================== Update that cart =====================//
            let updatePrice = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, items: arr, totalItems: totalItems } }, { new: true })

            return res.status(200).send({ status: true, message: "Success", data: updatePrice })
        }

        //===================== Condition for RemoveProduct value as 0 =====================//
        if (removeProduct == 0) {

            //===================== Fetch Total Items and Decrese 1 item =====================//
            let totalItem = getCart.totalItems - 1

            //===================== loop for arr =====================//
            for (let i = 0; i < arr.length; i++) {

                //===================== Decrese the TotalPrice  =====================//
                let prodPrice = getCart.totalPrice - (arr[i].quantity * getProduct.price)

                //===================== Condition for checking those two Product is matched or not =====================//
                if (arr[i].productId.toString() == productId) {

                    //===================== Pull that Product from that cart and Update values =====================//
                    let update2 = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, totalPrice: prodPrice, totalItems: totalItem }, { new: true })

                    return res.status(200).send({ status: true, message: "Success", data: update2 })
                }
            }
        }

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}



//<<<===================== This function is used for Fetch the Cart Data From DB =====================>>>//
const getCart = async (req, res) => {

    try {

        let userId = req.params.userId;

        //===================== Fetch Cart Data from DB =====================//
        let carts = await cartModel.findOne({ userId: userId }).populate('items.productId')
        if (!carts) return res.status(404).send({ status: false, message: "cart does not exist!" })

        //===================== Return Responce =====================//
        return res.status(200).send({ status: true, message: 'Success', data: carts })

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}


//<<<===================== This function is used for Delete the Cart Data =====================>>>//
const deleteCart = async (req, res) => {

    try {

        let userId = req.params.userId;

        //===================== Fetch Cart Data from DB and Delete Cart =====================//
        let cartDelete = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })
        if (!cartDelete) return res.status(404).send({ status: false, message: "cart does not exist!" })

        //===================== Return Responce =====================//
        return res.status(204).send()

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}






//===================== Module Export =====================//
module.exports = { createCart, getCart, deleteCart, updateCart }