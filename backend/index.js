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

    const otpStore = {};
    // Email OTPs

    app.post("/send-email-otp", async (req, res) => {
      const { email } = req.body;

      try {
        const otp = Math.floor(Math.random() * 9000 + 1000).toString(); // Ensure OTP is a string
        otpStore[email] = { otp, createdAt: new Date() }; // Store OTP in memory

        const msg = {
          to: email,
          from: process.env.SENDGRID_EMAIL,
          subject: "Your OTP Code",
          text: `Your OTP code is ${otp}`,
        };

        await sgMail.send(msg);

        res.status(200).send({ message: "OTP sent to your email" });
      } catch (error) {
        console.error(
          "Error sending email:",
          error.response ? error.response.body : error.message
        );
        res.status(500).send({ error: "Error sending OTP" });
      }
    });

    // SMS OTPs
    app.post("/send-sms-otp", async (req, res) => {
      const { phoneNumber } = req.body;

      try {
        const otp = Math.floor(Math.random() * 9000 + 1000).toString(); // Ensure OTP is a string
        otpStore[phoneNumber] = { otp, createdAt: new Date() }; // Store OTP in memory

        await client1.messages.create({
          body: `Your OTP code is ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        });

        res.status(200).send({ message: "OTP sent to your mobile number" });
      } catch (error) {
        console.error("Error sending SMS:", error.message);
        res.status(500).send({ error: "Error sending OTP" });
      }
    });

    // Verify Email OTP
    app.post("/verify-email-otp", async (req, res) => {
      const { email, otp } = req.body;

      if (!email || !otp || otp.length !== 4)
        return res
          .status(400)
          .send({ error: "Email and a 4-digit OTP are required" });

      try {
        const storedOtp = otpStore[email];
        if (!storedOtp || storedOtp.otp !== otp.trim())
          return res.status(400).send({ error: "Invalid OTP" });

        const otpExpiry = 5 * 60 * 1000; // 5 minutes
        if (Date.now() - new Date(storedOtp.createdAt).getTime() > otpExpiry)
          return res.status(400).send({ error: "OTP expired" });

        delete otpStore[email]; // Clear OTP after successful verification
        res.status(200).send({ message: "Email OTP verified successfully" });
      } catch (error) {
        console.error("Error verifying OTP:", error.message);
        res.status(500).send({ error: "Error verifying OTP" });
      }
    });

    // Verify SMS OTP

    app.post("/verify-sms-otp", async (req, res) => {
      const { phoneNumber, otp } = req.body;

      if (!phoneNumber || !otp || otp.length !== 4)
        return res
          .status(400)
          .send({ error: "Phone number and a 4-digit OTP are required" });

      try {
        const storedOtp = otpStore[phoneNumber];
        if (!storedOtp || storedOtp.otp !== otp.trim())
          return res.status(400).send({ error: "Invalid OTP" });

        const otpExpiry = 5 * 60 * 1000; // 5 minutes
        if (Date.now() - new Date(storedOtp.createdAt).getTime() > otpExpiry)
          return res.status(400).send({ error: "OTP expired" });

        delete otpStore[phoneNumber]; // Clear OTP after successful verification
        res.status(200).send({ message: "SMS OTP verified successfully" });
      } catch (error) {
        console.error("Error verifying OTP:", error.message);
        res.status(500).send({ error: "Error verifying OTP" });
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
