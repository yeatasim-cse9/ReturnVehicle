import app from "./app.js";
import { connectDB } from "./utils/db.js";
import { env } from "./config/env.js";

// Uncaught rejections/Exceptions guards
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

async function bootstrap() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running: http://localhost:${env.PORT}`);
  });
}

bootstrap();
