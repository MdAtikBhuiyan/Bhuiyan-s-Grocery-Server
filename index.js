const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors');
const app = express()
require('dotenv').config()

const port = process.env.PORT || 7000

app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vwvnp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.get('/', (req, res) => {
    res.send("Hello !! Welcome to Bhuiyan's Grocery.")
})




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('err',err);
    const productCollection = client.db("grocerydb").collection("products");
    const orderCollection = client.db("grocerydb").collection("orders");
    console.log("database connected successsfully");

    // add or create products
    app.post('/addProduct', (req,res) => {
        const product = req.body;
        console.log(product);
        productCollection.insertOne(product)
        .then(result => {
            console.log(result.insertedCount);
            res.send(result.insertedCount > 0)
        })

    })

    // show products in UI
    app.get("/showProducts",(req,res) => {
        productCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents)
        })
    })

    // load single product for checkout
    app.get('/product/:id',(req,res) => {
        const id = ObjectID(req.params.id)
        console.log('id',id);
        productCollection.find({_id: id})
        .toArray((err, documents) => {
            res.send(documents[0])
        })
    })

    // add orders
    app.post('/addOrder',(req,res) => {
        const orderedProduct = req.body;
        console.log('order',orderedProduct);
        orderCollection.insertOne(orderedProduct)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })
    // show ordered Product
    app.get('/showOrdersProduct/:email', (req,res) => {
        const email = req.params.email;
        console.log('email',email);
        orderCollection.find({email: email})
        .toArray((err,documents) => {
            res.send(documents)
        })
    })

    // delete product
    app.delete('/deleteProduct/:id',(req,res) => {
        const id = ObjectID(req.params.id)
        productCollection?.deleteOne({
            _id: id
        })
        .then( result => {
            console.log('delete',result)
            res.send(result.deletedCount > 0)
        })
    })

});


app.listen(port)