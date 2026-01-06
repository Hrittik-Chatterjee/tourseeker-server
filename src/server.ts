import { Server } from "http";
import app from "./app";
import config from "./config";

async function bootstrap() {
  let server: Server;

  try {
    server = app.listen(config.port, () => {
      console.log(`🚀 TourSeeker Server is running on port ${config.port}`);
      console.log(`Environment: ${config.node_env}`);
      console.log(`Health check: http://localhost:${config.port}`);
      console.log(`API Base: http://localhost:${config.port}/api/v1`);
    });

    const exitHandler = () => {
      if (server) {
        server.close(() => {
          console.log("Server closed gracefully.");
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };

    // Handle unhandled rejections
    process.on("unhandledRejection", (error) => {
      console.log("❌ Unhandled Rejection detected...");
      console.error(error);
      if (server) {
        server.close(() => {
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.log("❌ Uncaught Exception detected...");
      console.error(error);
      process.exit(1);
    });

    // Handle termination signals
    process.on("SIGTERM", () => {
      console.log("SIGTERM received");
      exitHandler();
    });
  } catch (error) {
    console.error("❌ Error during server startup:", error);
    process.exit(1);
  }
}

bootstrap();
