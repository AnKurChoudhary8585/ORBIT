import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");
  } catch (error) {
    console.error("Connection failed:", error.message);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
