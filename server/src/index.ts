import dotenv from "dotenv";
import express, { Application } from "express";
import cors from "cors";
import authenticateMiddleware from "./middleware/authenticateMiddleware";
import connection from "./db";

import userRoutes from "./routes/user";
import huggingFaceRoute from "./routes/huggingFace";
import chatRoute from "./routes/chat.route";
import chatThreadRoutes from "./routes/chatThread.route";
import chatMessageRoutes from "./routes/chatMessage.route";

dotenv.config();
// Ensure connection is initiated correctly with appropriate types
function connectToDatabase() {
  try {
    connection();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database: ", error);
  }
}

// database connection
connectToDatabase();

// Initialize the express app
const app: Application = express();

// middlewares
app.use(express.json());
app.use(cors());

// routes with type verification
app.use("/api/user", authenticateMiddleware, userRoutes);
app.use("/huggingFace/redye", authenticateMiddleware, huggingFaceRoute);
app.use("/api/chat", chatRoute);
app.use("/api/chat-threads", authenticateMiddleware, chatThreadRoutes); // For chat threads (list, create)
app.use("/api/chat-messages", authenticateMiddleware, chatMessageRoutes); // For chat messages (post, get by thread)

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));