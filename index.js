const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a7xog.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());

const port = 5000;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productCollection = client.db(`${process.env.DB_NAME}`).collection("products");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");

  app.get('/', (req, res) => {
    res.send("It's working");
  })

  app.get('/products', (req, res) => {
      productCollection.find({})
      .toArray( (err, documents) => {
        res.send(documents);
      })
  })

  app.get('/product/:id', (req, res) => {
    productCollection.find({_id: ObjectId(req.params.id)})
    .toArray( (err, documents) => {
        res.send(documents[0]);
    })
})

  app.get('/orders/:email', (req, res) => {
    const email = req.params.email;
    orderCollection.find({email: email})
    .toArray( (err, documents) => {
        res.send(documents);
    })
})

  app.get('/searchProducts/:pName', (req, res) => {
    const pName = req.params.pName;
    productCollection.find({pName: new RegExp(pName, 'i')})
    .toArray( (err, documents) => {
        res.send(documents);
    })
})

  app.post('/addProduct', (req, res) => {
      const product = req.body;
      productCollection.insertOne(product)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  app.post('/addOrder', (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  app.delete('/deleteProduct/:id', (req, res) => {
    productCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then(result => {
      res.send(result.deletedCount > 0);
    })
  })

  app.delete('/deleteOrder/:id', (req, res) => {
    orderCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then(result => {
      res.send(result.deletedCount > 0);
    })
  })

  app.patch('/updateProduct/:id', (req, res) => {
    productCollection.updateOne({_id: ObjectId(req.params.id)},
    {
        $set: {pName: req.body.pName, weight: req.body.weight, price: req.body.price}
    })
    .then(result => {
        res.send(result.modifiedCount > 0);
    })
  });

//   client.close();
});

app.listen(process.env.PORT || port);