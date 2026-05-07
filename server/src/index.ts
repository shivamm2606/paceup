import "dotenv/config";
import mongoose from "mongoose";
import ConnectDB from "./config/db.js";
import app from "./app.js";

const port = process.env.PORT || 8000;

ConnectDB()
  .then(() => {
    const server = app.listen(Number(port), () =>
      console.log(`Server running on port ${port}`),
    );

    const shutdown = async () => {
      console.log("\nShutting down...");
      server.close(async () => {
        await mongoose.connection.close();
        console.log("Closed all connections");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
