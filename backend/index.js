const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5000", // Adjust as needed
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");

const port = process.env.PORT || 5000;
const twilio = require("twilio");
const sgMail = require("@sendgrid/mail");

app.use(express.json());
app.use(bodyParser.json());

sgMail.setApiKey(process.env.sg_ApiKey);
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client1 = require("twilio")(accountSid, authToken);

sgMail.setApiKey(process.env.sg_ApiKey);

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

sgMail.setApiKey(process.env.sg_ApiKey);
let otpStore = {};
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

    // Email OTP's
    app.post("/send-email-otp", async (req, res) => {
      const { email, otp } = req.body;

      try {
        const msg = {
          to: email,
          from: process.env.SENDGRID_EMAIL,
          subject: "Your OTP Code",
          text: `Your OTP code is ${otp}`,
        };

        await sgMail.send(msg);
        otpStore[email] = otp;
        console.log(`OTP sent to email: ${email}, OTP: ${otp}`); // Debugging
        res.status(200).send({ message: "OTP sent to your email" });
      } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send({ error: "Error sending OTP" });
      }
    });

    app.post("/send-sms-otp", async (req, res) => {
      const { phoneNumber, otp } = req.body;

      if (!phoneNumber || !otp) {
        return res
          .status(400)
          .send({ error: "Phone number and OTP are required" });
      }

      const formattedPhoneNumber = addDefaultCountryCode(phoneNumber);

      try {
        const message = await client1.messages.create({
          body: `Your OTP code is ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhoneNumber,
        });

        otpStore[formattedPhoneNumber] = otp; // Store OTP
        console.log(
          `SMS sent: ${message.sid}, to: ${formattedPhoneNumber}, OTP: ${otp}`
        ); // Debugging
        res.status(200).send({ message: "OTP sent to your mobile number" });
      } catch (error) {
        console.error("Error sending SMS:", error);
        res.status(500).send({ error: "Error sending OTP" });
      }
    });

    const clearOtp = (contact) => {
      if (otpStore[contact]) {
        delete otpStore[contact];
        console.log(`OTP for ${contact} has been cleared.`);
      } else {
        console.log(`No OTP found for ${contact}.`);
      }
    };
    // Updated endpoint for verifying OTP sent via email
    app.post("/verify-email-otp", (req, res) => {
      const { email, otp } = req.body;

      if (otpStore[email] === otp) {
        clearOtp(email); // Clear OTP after successful verification
        res.status(200).send({ message: "OTP verified successfully" });
      } else {
        res.status(400).send({ error: "Invalid OTP" });
      }
    });

    // Updated endpoint for verifying OTP sent via SMS
    app.post("/verify-sms-otp", (req, res) => {
      const { phoneNumber, otp } = req.body;

      if (otpStore[phoneNumber] === otp) {
        clearOtp(phoneNumber); // Clear OTP after successful verification
        res.status(200).send({ message: "OTP verified successfully" });
      } else {
        res.status(400).send({ error: "Invalid OTP" });
      }
    });
  } catch (error) {
    console.log(error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Twitter Clone!");
});

app.listen(port, () => {
  console.log(`Twitter clone is listening on port ${port}`);
});
