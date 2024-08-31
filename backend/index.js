const express = require("express");
require("dotenv").config();
const app = express();
const UAParser = require("ua-parser-js");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const sgMail = require("@sendgrid/mail");
const client1 = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:3000", "https://twitter-seven-puce.vercel.app"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.json());
app.use(bodyParser.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const loginHistoryCollection = client
      .db("database")
      .collection("Login History");
    const postCollection = client.db("database").collection("posts");
    const userCollection = client.db("database").collection("users");
    const audioCollection = client.db("database").collection("audios");

    // Endpoint to fetch login history for a user
    app.get("/login-history", async (req, res) => {
      const { email } = req.query; // Email should be passed as a query parameter

      if (!email) {
        return res.status(400).send({ error: "Email is required" });
      }

      try {
        const loginHistoryCollection = client
          .db("database")
          .collection("LoginHistory");
        const history = (
          await loginHistoryCollection.find({ email }).toArray()
        ).reverse();
        res.status(200).send(history);
      } catch (error) {
        console.error("Error fetching login history:", error);
        res.status(500).send({ error: "Error fetching login history" });
      }
    });
    // Collect user login information
    app.post("/verify-login", async (req, res) => {
      try {
        const { email } = req.body;
        const ip = req.ip;
        const userAgent = req.headers["user-agent"];
        const parser = new UAParser(userAgent);
        const result = parser.getResult();
        const browser = result.browser.name || "Unknown";
        const os = result.os.name || "Unknown";
        const deviceType = result.device.type || "desktop";

        console.log(
          `Login attempt: IP=${ip}, Browser=${browser}, OS=${os}, DeviceType=${deviceType}`
        );

        const loginHistory = {
          email,
          timestamp: new Date(),
          ip,
          browser,
          os,
          deviceType,
        };

        await loginHistoryCollection.insertOne(loginHistory);

        if (browser === "Chrome") {
          const otp = Math.floor(1000 + Math.random() * 9000).toString();
          otpStore[email] = { otp, createdAt: new Date() };

          const msg = {
            to: email,
            from: process.env.SENDGRID_EMAIL,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}`,
          };

          await sgMail.send(msg);
          res.status(200).json({ message: "OTP sent to your email" });
        } else if (browser === "Edge") {
          res.status(200).json({
            message: "Access granted without additional authentication",
          });
        } else if (deviceType === "mobile") {
          const currentTime = new Date().getHours();
          if (currentTime >= 10 && currentTime <= 13) {
            res
              .status(200)
              .json({ message: "Access granted during allowed hours" });
          } else {
            res
              .status(401)
              .json({ error: "Access denied outside allowed hours" });
          }
        } else {
          res.status(403).json({ error: "Unsupported browser or device type" });
        }
      } catch (error) {
        console.error("Error in verify-login:", error.message);
        res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    });
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
      const post = (await postCollection.find({ email: email }).toArray(),
      await audioCollection.find({ email: email }).toArray()).reverse();
      res.send(post);
    });
    app.get("/record", async (req, res) => {
      const records = (await audioCollection.find().toArray()).reverse();
      res.send(records);
    });
    // post
    app.post("/register", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    //POSTS
    app.post("/post", async (req, res) => {
      try {
        const { email, post, photo, audio } = req.body;

        const newPost = {
          email,
          post,
          photo,
          audio,
        };
        const postResult = await postCollection.insertOne(newPost);

        res.send({
          message: "Post created successfully!",
          postId: postResult.insertedId,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error creating post" });
      }
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
    //OTPs EMAIL AND MOBILE NUMBER
    const otpStore = {};
    // Email OTPs

    app.post("/send-email-otp", async (req, res) => {
      const { email } = req.body;

      try {
        const otp = Math.floor(Math.random() * 9000 + 1000).toString();
        otpStore[email] = { otp, createdAt: new Date() };

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
        const otp = Math.floor(Math.random() * 9000 + 1000).toString();
        otpStore[phoneNumber] = { otp, createdAt: new Date() };
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

        const otpExpiry = 5 * 60 * 1000;
        if (Date.now() - new Date(storedOtp.createdAt).getTime() > otpExpiry)
          return res.status(400).send({ error: "OTP expired" });

        delete otpStore[email];
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

        const otpExpiry = 5 * 60 * 1000;
        if (Date.now() - new Date(storedOtp.createdAt).getTime() > otpExpiry)
          return res.status(400).send({ error: "OTP expired" });

        delete otpStore[phoneNumber];
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
