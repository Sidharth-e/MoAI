require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const verifyToken= require( "./middleware/auth");
const connection = require("./db");

const userRoutes = require("./routes/user");
const huggingFaceRoute = require("./routes/huggingFace");
const chatRoute = require("./routes/chat.route");
const chatThreadRoutes = require("./routes/chatThread.route");
const chatMessageRoutes = require("./routes/chatMessage.route");
const emailValidationRoutes = require("./routes/common/email");



// database connection
connection();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/user",verifyToken, userRoutes);
app.use("/huggingFace/redye",verifyToken,  huggingFaceRoute);
app.use("/api/chat",verifyToken,  chatRoute);
app.use("/api/chat-threads", verifyToken, chatThreadRoutes);       // For chat threads (list, create)
app.use("/api/chat-messages", verifyToken, chatMessageRoutes);     // For chat messages (post, get by thread)
app.use("/api/email",verifyToken,  emailValidationRoutes);  


const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));
