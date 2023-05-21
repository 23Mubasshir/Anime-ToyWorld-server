const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p1ooveo.mongodb.net/?retryWrites=true&w=majority`;

// middleware
app.use(cors());
app.use(express.json());

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

    const toyCollection = client.db("toyDB").collection("toy");
    const ascending = { price: 1 };
    const descending = { price: -1 };

    //Create toys
    app.post("/add-toys", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toyCollection.insertOne(newToy);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again later",
          status: false,
        });
      }
    });
    //get all toys
    app.get("/all-toys", async (req, res) => {
      const result = await toyCollection.find({}).limit(20).toArray();
      res.send(result);
    });

    // get toys by ascending / descending
    app.get("/all-toys/:category", async (req, res) => {
      // console.log(req.params.category);
      if (req.params.category == "ascending") {
        const result = await toyCollection
          .find()
          .sort(ascending)
          .limit(20)
          .toArray();
        res.send(result);
      } else if (req.params.category == "descending") {
        const result = await toyCollection
          .find()
          .sort(descending)
          .limit(20)
          .toArray();
        res.send(result);
      }
    });

    // get my toys by ascending or descending
    app.get("/my-toys/:email/:category", async (req, res) => {
      console.log(req.params.category);
      console.log(req.params.email);

      if (req.params.category == "descending") {
        const result = await toyCollection.find().sort(descending).toArray();
        res.send(result);
      } else if (req.params.category == "ascending") {
        const result = await toyCollection.find().sort(ascending).toArray();
        res.send(result);
      }
    });

    // get my toys by gmail
    app.get("/my-toys/:email", async (req, res) => {
      // console.log(req.params.id);
      const jobs = await toyCollection
        .find({
          email: req.params.email,
        })
        .toArray();
      res.send(jobs);
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

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
