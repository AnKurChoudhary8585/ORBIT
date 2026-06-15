import serverless from "serverless-http";
import connectDB from "../../src/db/index.js";
import { app } from "../../src/app.js";

const serverlessHandler = serverless(app, {
  basePath: '/.netlify/functions/api'
});

let dbConnected = false;

export const handler = async (event, context) => {
  // Allow database connections to be reused across warm lambda containers
  context.callbackWaitsForEmptyEventLoop = false;

  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (error) {
      console.error("Database connection error in serverless context:", error);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          message: "Database connection failed",
          error: error.message
        })
      };
    }
  }

  return await serverlessHandler(event, context);
};
