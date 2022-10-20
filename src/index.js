//<<<=====================Importing Module and Packages=====================>>>//
const express = require('express');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const moment = require('moment');
const app = express();
const multer = require('multer')

app.use(express.json());
app.use(multer().any())

//===================== Make Relation Between MongoDb and Nodejs with MongoDb Cluster Link  =====================//
mongoose.connect("mongodb+srv://raj_3028:kWaM507ps0Icsdg0@cluster0.pw23ckf.mongodb.net/group21Database", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is Connected..."))
    .catch(error => console.log(error))

// ===================== Global Middleware for Console the Date, Time, IP Address and Print the perticular API Route Name when you will hit that API =====================//
app.use(
    function globalMiddleWare(req, res, next) {
        const DateAndTime = moment().format('YYYY-MM-DD hh:mm:ss a');
        console.log(`************************************************************************`)
        console.log(`Date:- ${DateAndTime}, IP Address:- ${req.ip}, API Route Info:- ${req.originalUrl}`)
        next()
    })

//===================== Global Middleware for All Route =====================//
app.use('/', route)

//===================== It will Handle error When You input Wrong Route =====================//
// app.use(function (req, res) {
//     var err = new Error("Not Found.")
//     err.status = 400
//     return res.status(400).send({ status: "400", message: "Path not Found." })
// })

//===================== PORT =====================//
app.listen(process.env.PORT || 3000, function () {
    console.log('Express App Running on Port: ' + (process.env.PORT || 3000))
});

//<<<=======================================================================>>>//