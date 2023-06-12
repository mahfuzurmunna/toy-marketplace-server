// required files

const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rk10a10.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const toyCollection = client.db("toyDB").collection("toyDetails");

    // getting data from client to database
    app.post("/alltoys", async (req, res) => {
      const receivedToy = req.body;
      const result = await toyCollection.insertOne(receivedToy);
      res.send(result);
    });

    //getting data from database to server side
    app.get("/alltoys", async (req, res) => {
      const { toyName } = req.query;
      let query = {};
      if (toyName) {
        query = { name: { $regex: toyName, $options: "i" } };
      }
      const cursor = toyCollection.find(query);
      const result = await cursor.limit(20).toArray();
      res.json(result);
    });

    //getting specific toy details from database to server side
    app.get("/alltoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    // getting indvidual email data from server to client
    app.get("/alltoy/:email&:view", async (req, res) => {
      const sellerEmail = req.params.email;
      const view = req.params.view;
      const query = {
        email: sellerEmail,
      };

      const result = await toyCollection
        .find(query)
        .sort({ price: view })
        .toArray();

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//server starting

app.get("/", (req, res) => {
  res.send("Toy marketplace server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
