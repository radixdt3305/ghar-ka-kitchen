// Quick script to approve kitchen in MongoDB
// Run: node approve-kitchen.js

import mongoose from "mongoose";

const MONGO_URI = "mongodb://shubham_chauhan:deep70@radixusers2.com:27017/shubham_chauhan?authMechanism=DEFAULT&authSource=shubham_chauhan";

async function approveKitchen() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all pending kitchens
    const kitchens = await mongoose.connection.db.collection("kitchens").find({ status: "pending" }).toArray();
    
    console.log("\n📋 Pending Kitchens:");
    kitchens.forEach((k, i) => {
      console.log(`\n${i + 1}. Kitchen: ${k.name}`);
      console.log(`   ID: ${k._id}`);
      console.log(`   Cook ID: ${k.cookId}`);
      console.log(`   Status: ${k.status}`);
    });

    if (kitchens.length > 0) {
      // Approve the first one (or change index)
      const kitchenToApprove = kitchens[0];
      
      await mongoose.connection.db.collection("kitchens").updateOne(
        { _id: kitchenToApprove._id },
        { $set: { status: "approved" } }
      );
      
      console.log(`\n✅ Approved kitchen: ${kitchenToApprove.name}`);
    } else {
      console.log("\n⚠️ No pending kitchens found");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

approveKitchen();
