const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config();
const app = express()
app.use(cors());
const fileUpload = require('express-fileupload')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(fileUpload())
const port = 5000
const { ObjectID } = require('mongodb');

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r5dyr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const adminCollection = client.db(process.env.DB_NAME).collection("admin");
    const orderCollection = client.db(process.env.DB_NAME).collection("orders");
    const reviewCollection = client.db(process.env.DB_NAME).collection("reviews");
    const serviceCollection = client.db(process.env.DB_NAME).collection("services");

    // add admin
    app.post('/addAdmin', (req, res) => {
        adminCollection.insertOne(req.body)
            .then(result => {
                res.status(200).send(result.insertedCount > 0)
            })
    });

    //get admin
    app.get('/getAdmin', (req, res) => {
        const userEmail = req.query.email;
        adminCollection.find({ email: userEmail })
            .toArray((err, documents) => {
                if (err) {
                    console.log(err)
                }
                res.send(documents);
            })
    });

    // add services
    app.post('/addService', (req, res) => {

        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ title, description, image })
            .then(result => {
                res.status(200).send(result.insertedCount > 0);
            })
    });

    //get service list getServices
    app.get('/getServices', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    //get orders for particular user
    app.get('/getUserOrders', (req, res) => {
        const userEmail = req.query.email;
        orderCollection.find({ email: userEmail })
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    //get admin order list
    app.get('/getClientOrders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    //get Client Feedback
    app.get('/getClientFeedback', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    //add client feedback
    app.post('/addReview', (req, res) => {
        const name = req.body.name;
        const companyName = req.body.companyName;
        const message = req.body.message;
        const image = req.body.image;

        reviewCollection.insertOne({ name, companyName, message, image })
            .then(result => {
                res.status(200).send(result.insertedCount > 0);
            })

    });

    // add user order
    app.post('/addOrder', (req, res) => {

        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const serviceName = req.body.serviceName;
        const projectDetail = req.body.projectDetail;
        const price = req.body.price;
        const status = 'Pending';

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        orderCollection.insertOne({ name, email, serviceName, projectDetail, price, status, image })
            .then(result => {
                res.status(200).send(result.insertedCount > 0);
            })
    });

    // Update  order status
    app.patch('/updateOrderStatus/:id', (req, res) => {
        orderCollection.updateOne({ _id: ObjectID(req.params.id) },
            {
                $set: { status: req.body.status }
            })
            .then(result => {
                res.send(result.modifiedCount > 0);
            })
    });

});


app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(process.env.PORT || 5000);