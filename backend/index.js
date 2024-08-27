const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
const sgMail = require("@sendgrid/mail");
const client1 = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:3000", "https://twitter-seven-puce.vercel.app"], // Allowed origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies and other credentials
  })
);

app.options("*", cors()); // Allow preflight for all routes

app.use(express.json());
app.use(bodyParser.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// Store OTPs in a database for better scalability and security
const otpCollection = client.db("database").collection("otps");

async function run() {
  try {
    await client.connect();
    const postCollection = client.db("database").collection("posts"); // this collection is for team-ekt
    const userCollection = client.db("database").collection("users"); // this collection is for team-srv

    // get
    app.get("/user", async (req, res) => {
      const user = await userCollection.find().toArray();
      res.send(user);
    });
    app.get("/loggedInUser", async (req, res) => {
      const email = req.query.email;
      const user = await userCollection.find({ email: email }).toArray();
      res.send(user);
    });
    app.get("/post", async (req, res) => {
      const post = (await postCollection.find().toArray()).reverse();
      res.send(post);
    });
    app.get("/userPost", async (req, res) => {
      const email = req.query.email;
      const post = (
        await postCollection.find({ email: email }).toArray()
      ).reverse();
      res.send(post);
    });

    // post
    app.post("/register", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.post("/post", async (req, res) => {
      const post = req.body;
      const result = await postCollection.insertOne(post);
      res.send(result);
    });

    // patch
    app.patch("/userUpdates/:email", async (req, res) => {
      const filter = req.params;
      const profile = req.body;
      const options = { upsert: true };
      const updateDoc = { $set: profile };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // Email OTPs
    app.post("/send-email-otp", async (req, res) => {
      const { email } = req.body;

      try {
        const otp = Math.floor(Math.random() * 9000 + 1000);

        const msg = {
          to: email,
          from: process.env.SENDGRID_EMAIL,
          subject: "Your OTP Code",
          text: `Your OTP code is ${otp}`,
        };

        await sgMail.send(msg);

        await otpCollection.insertOne({
          email,
          otp,
          type: "email",
          createdAt: new Date(),
        });

        res.status(200).send({ message: "OTP sent to your email" });
      } catch (error) {
        console.error("Error sending email OTP:", error);
        res.status(500).send({ error: "Failed to send OTP" });
      }
    });

    // SMS OTPs
    app.post("/send-sms-otp", async (req, res) => {
      const { phoneNumber } = req.body;

      try {
        const otp = Math.floor(Math.random() * 9000 + 1000);

        await client1.messages.create({
          body: `Your OTP code is ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        });

        await otpCollection.insertOne({
          phoneNumber,
          otp,
          type: "sms",
          createdAt: new Date(),
        });

        res.status(200).send({ message: "OTP sent to your phone" });
      } catch (error) {
        console.error("Error sending SMS OTP:", error);
        res.status(500).send({ error: "Failed to send OTP" });
      }
    });

    // Verify email OTP
    app.post("/verify-email-otp", async (req, res) => {
      const { email, otp } = req.body;

      try {
        const otpDoc = await otpCollection.findOne({
          email,
          otp: otp.trim(),
          type: "email",
        });

        if (!otpDoc) {
          return res.status(400).send({ error: "Invalid OTP" });
        }

        const otpExpiry = 5 * 60 * 1000; // 5 minutes
        if (Date.now() - new Date(otpDoc.createdAt).getTime() > otpExpiry) {
          return res.status(400).send({ error: "OTP expired" });
        }

        res.status(200).send({ message: "OTP verified successfully" });
      } catch (error) {
        console.error("Error verifying email OTP:", error);
        res.status(500).send({ error: "Failed to verify OTP" });
      }
    });

    // Verify SMS OTP
    app.post("/verify-sms-otp", async (req, res) => {
      const { phoneNumber, otp } = req.body;

      try {
        const otpDoc = await otpCollection.findOne({
          phoneNumber,
          otp: otp.trim(),
          type: "sms",
        });

        if (!otpDoc) {
          return res.status(400).send({ error: "Invalid OTP" });
        }

        const otpExpiry = 5 * 60 * 1000; // 5 minutes
        if (Date.now() - new Date(otpDoc.createdAt).getTime() > otpExpiry) {
          return res.status(400).send({ error: "OTP expired" });
        }

        res.status(200).send({ message: "OTP verified successfully" });
      } catch (error) {
        console.error("Error verifying SMS OTP:", error);
        res.status(500).send({ error: "Failed to verify OTP" });
      }
    });
  } finally {
    // Ensure the client will close when you finish/error
    // await client.close(); (Don't close it if you want to keep the server running)
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
