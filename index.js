const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000

// Middleware 
app.use(cors());
app.use(express.json());


// MongoDB Connection 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h80zj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send('Hello Ceramic World!')
  })

async function run (){
    try{
        await client.connect();
        const database = client.db('ceramic_world');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');


        // GET Products Data API 
        app.get('/products', async(req, res)=>{
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // Post API for Orders 
        app.post('/orders', async(req, res)=>{
          const order = req.body;
          const result = await ordersCollection.insertOne(order);
          res.json(result)
      })


    }
    finally{
        // await client.close()
    }
}
run().catch(console.dir);

  
  app.listen(port, () => {
    console.log(`Server Running at ${port}`)
  })