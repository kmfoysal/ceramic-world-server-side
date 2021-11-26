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
        const reviewsCollection = database.collection('reviews');


        // GET Products Data API 
        app.get('/products', async(req, res)=>{
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // GET Reviews API 
        app.get('/reviews', async(req, res)=>{
          const cursor = reviewsCollection.find({});
          const reviews = await cursor.toArray();
          res.send(reviews);
      })

         // GET API For Orders
         app.get('/orders', async(req, res)=>{
          const email = req.query.email;
          const query = {email: email} 
          const cursor = ordersCollection.find(query);
          const orders = await cursor.toArray();
          res.send(orders);
      })

        // GET API For All Orders
        app.get('/allOrders', async(req, res)=>{
          const cursor = ordersCollection.find({});
          const allOrders = await cursor.toArray();
          res.send(allOrders);
      })


      // Get Api for Admin Access 
      app.get('/users/:email', async(req,res)=>{
        const email = req.params.email;
        const query = {email:email};
        const user = await usersCollection.findOne(query);
        let isAdmin = false;

        if(user?.role === 'admin'){
          isAdmin = true;
        }
        res.json({admin : isAdmin});
      })


        // Post API for Orders 
        app.post('/orders', async(req, res)=>{
          const order = req.body;
          const result = await ordersCollection.insertOne(order);
          res.json(result)
      })

      // Post api for create user
      app.post('/users', async(req, res)=>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
          res.json(result)
      })

      // Post Api for Add Products 
      app.post('/products', async(req, res)=>{
        const newProduct = req.body;
        const result = await productsCollection.insertOne(newProduct);
        res.json(result);

      })

       // Post Api for Add Reviews 
       app.post('/reviews', async(req, res)=>{
        const newReview = req.body;
        const result = await reviewsCollection.insertOne(newReview);
        console.log(req.body);
        res.json(result);

      })


      // Put api for upsart google login
      app.put('/users', async(req, res)=>{
        const user = req.body;
        const filter = {email: user.email};
        const options = {upsert:true};
        const updateUser = {$set: user};
        const result = await usersCollection.updateOne(filter, updateUser, options)
        res.json(result);
      })


      // Put api for update user role
      app.put('/users/admin', async(req, res)=>{
        const user = req.body;
        const filter = {email: user.email};
        const updateUser = {$set: {role: 'admin'}};
        const result = await usersCollection.updateOne(filter, updateUser)
        res.json(result);
      })


      // Update Order Status to Approved
       app.put('/changeStatus/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const updateDoc = {
            $set: {
                status: 'Shipped'
            }
        };
        const result = await ordersCollection.updateOne(query, updateDoc);
        res.json(result)
    })
      

       // DELETE API Orders
       app.delete('/orders/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await ordersCollection.deleteOne(query);
        res.json(result);
      })

      // DELETE API Products
      app.delete('/products/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await productsCollection.deleteOne(query);
        res.json(result);
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


  // ------------------END------------------------