const express = require("express");
const axios = require("axios");
require("dotenv").config();
const app = express();
const UAParser = require("ua-parser-js");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const sgMail = require("@sendgrid/mail");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const streamifier = require("streamifier");
const client1 = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const port = process.env.PORT || 5000;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
const upload = multer();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://twitter-seven-puce.vercel.app"],
    "Cross-Origin-Embedder-Policy": "unsafe-none",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.options("*", cors());
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});
app.use(express.json());
app.use(bodyParser.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Helper function to check if current time is within allowed timeframe
function isWithinTimeframe(startHour, endHour) {
  const currentTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  const currentHour = new Date(currentTime).getHours();
  return currentHour >= startHour && currentHour < endHour;
}
// Apply the middleware to all routes or specific routes
const isWithinTimeframe = () => {
  const currentTime = new Date();
  const currentHour = currentTime.getHours(); // Get the hour directly from the Date object

  // Alternatively, if you need the hour in IST specifically:
  const options = { timeZone: "Asia/Kolkata" };
  const currentHourIST = new Date().toLocaleString("en-US", options);
  const hour = new Date(currentHourIST).getHours(); // Correctly parse the hour in IST

  // Continue with your time comparison logic
};

function enforceMobileTimeRestrictions(req, res, next) {
  if (req.device.type === "mobile" && !isWithinTimeframe(10, 13)) {
    // 10 AM to 1 PM IST
    return res.status(403).send({
      error:
        "Access is restricted for mobile devices outside of 10 AM to 1 PM IST",
    });
  }
  next();
}

app.use(enforceMobileTimeRestrictions);

// Middleware to enforce time restrictions for mobile devices
function enforceMobileTimeRestrictions(req, res, next) {
  const userAgent = req.headers["user-agent"];
  const parser = new UAParser(userAgent);
  const { device } = parser.getResult();

  // console.log("User Agent:", userAgent);
  // console.log("Device Type:", device.type);

  if (device.type === "mobile") {
    const isAllowedTime = isWithinTimeframe(10, 13); // 10 AM to 1 PM IST
    // console.log("Is Allowed Time:", isAllowedTime);
    if (!isAllowedTime) {
      return res.status(403).send({
        error:
          "Access is restricted for mobile devices outside of 10 AM to 1 PM IST",
      });
    }
  }

  next();
}

async function run() {
  try {
    await client.connect();
    const loginHistoryCollection = client
      .db("database")
      .collection("Login History");
    const postCollection = client.db("database").collection("posts");
    const userCollection = client.db("database").collection("users");

    // get
    app.get("/", async (req, res) => {
      res.send("Welcome to the Twitter Clone's backend!!!!");
    });
    // Backend code to fetch login history
    app.get("/loginHistory/:email", async (req, res) => {
      const { email } = req.params;

      try {
        const loginHistory = (
          await loginHistoryCollection.find({ email }).toArray()
        ).reverse();
        res.json(loginHistory);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch login history" });
      }
    });
    app.get("/phoneHistory/:phoneNumber", async (req, res) => {
      const { phoneNumber } = req.params;
      try {
        const loginHistory = (
          await loginHistoryCollection.find({ phoneNumber }).toArray()
        ).reverse();
        res.json(loginHistory);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch login history" });
      }
    });

    app.get("/user", async (req, res) => {
      const user = await userCollection.find().toArray();
      res.send(user);
    });

    app.get("/loggedInUser", async (req, res) => {
      const { email, phoneNumber } = req.query;
      let query = {};
      if (email) {
        query.email = email;
      } else if (phoneNumber) {
        query.phoneNumber = phoneNumber;
      }
      try {
        const user = await userCollection.findOne(query);
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }
        res.send([user]);
      } catch (error) {
        console.error("Error fetching logged-in user data:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    app.get("/post", async (req, res) => {
      try {
        const post = (await postCollection.find().toArray()).reverse();
        res.send(post);
      } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send({ error: "Failed to fetch posts" });
      }
    });

    app.get("/userPost", async (req, res) => {
      const { email, phoneNumber } = req.query;

      const query = email ? { email } : { phoneNumber };

      try {
        const posts = await postCollection.find(query).toArray();

        res.send(posts.reverse());
      } catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // post
    app.post("/register", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    //POSTS

    app.post("/post", upload.none(), async (req, res) => {
      console.log("Post Data Received:", req.body); // Add this line to log incoming post data
      try {
        const post = req.body;
        const result = await postCollection.insertOne(post);
        res.send(result);
      } catch (error) {
        console.error("Error posting:", error);
        res.status(500).send({ error: "Failed to post data" });
      }
    });

    app.post("/upload-audio", upload.single("audio"), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).send({ error: "No file uploaded" });
        }

        const streamUpload = (file) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "auto" },
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });
        };

        const result = await streamUpload(req.file.buffer);
        res.send(result);
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        res.status(500).send({ error: "Failed to upload audio" });
      }
    });

    app.post("/loginHistory", async (req, res) => {
      try {
        const { email } = req.body.systemInfo;

        const ipAddress = await axios.get("https://api.ipify.org?format=json");
        const userAgent = req.headers["user-agent"];
        const parser = new UAParser(userAgent);
        const { browser, os, device } = parser.getResult();

        if (browser.name === "Chrome") {
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
        }
        if (device.type === "mobile") {
          app.use(enforceMobileTimeRestrictions);
        }

        const loginHistory = {
          email,
          ip: ipAddress.data.ip,
          browser: `${browser.name} ${browser.version}`,
          os: `${os.name} ${os.version}`,
          device: device.type || "Desktop",
          timestamp: new Date(),
        };

        const result = await loginHistoryCollection.insertOne(loginHistory);
        res.send(result);
      } catch (error) {
        console.error("Error storing login history:", error.message);
        res.status(500).send({ error: "Failed to store login history" });
      }
    });
    app.post("/phoneHistory", async (req, res) => {
      try {
        const { phoneNumber } = req.body;
        const ipAddress = await axios.get("https://api.ipify.org?format=json");
        const userAgent = req.headers["user-agent"];
        const parser = new UAParser(userAgent);
        const { browser, os, device } = parser.getResult();

        const loginHistory = {
          phoneNumber,
          ip: ipAddress.data.ip,
          browser: `${browser.name} ${browser.version}`,
          os: `${os.name} ${os.version}`,
          device: device.type || "Desktop",
          timestamp: new Date(),
        };
        if (device.type === "mobile") {
          app.use(enforceMobileTimeRestrictions);
        }

        const result = await loginHistoryCollection.insertOne(loginHistory);

        res
          .status(201)
          .json({ message: "Login history captured successfully", result });
      } catch (error) {
        console.error("Error storing login history:", error.message);
        res.status(500).send({ error: "Failed to store login history" });
      }
    });

    // patch

    app.patch("/userUpdates/:identifier", async (req, res) => {
      const { identifier } = req.params;
      const profileUpdates = req.body;

      // Determine the filter based on identifier
      const filter = identifier.includes("@")
        ? { email: identifier }
        : { phoneNumber: identifier };

      try {
        // Check if the user exists
        const existingUser = await userCollection.findOne(filter);

        if (!existingUser) {
          return res
            .status(404)
            .send({ message: "User not found, no document updated" });
        }

        // Filter out undefined or unwanted fields from profileUpdates
        const validUpdates = Object.fromEntries(
          Object.entries(profileUpdates).filter(
            ([key, value]) => value != null && value !== ""
          )
        );

        if (Object.keys(validUpdates).length === 0) {
          return res
            .status(400)
            .send({ message: "No valid fields provided for update" });
        }

        const updateDoc = { $set: validUpdates };

        // Perform the update operation
        const result = await userCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res
            .status(404)
            .send({ message: "User not found, no document updated" });
        }

        console.log("Database Update Result:", result);
        res.send(result);
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Internal Server Error");
      }
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

        const otpExpiry = 2 * 60 * 1000;
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
