import dotenv from "dotenv";
dotenv.config();

import {v2 as cloudinary} from "cloudinary";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

async function test() {
    try {
        console.log("Keys:", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY);
        // We will just print if we have access to cloudinary
        const res = await cloudinary.api.ping();
        console.log("Ping res:", res);
    } catch(e) {
        console.error(e);
    }
}
test();
