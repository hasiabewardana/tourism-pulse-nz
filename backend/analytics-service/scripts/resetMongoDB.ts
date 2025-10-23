import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/tourismpulsenz_analytics";

async function resetMongoDB() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db: Db = client.db();

    console.log("\n=== Dropping All Existing Collections ===");
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      if (collection.name.startsWith("system.")) {
        console.log(`Skipping system collection: ${collection.name}`);
        continue;
      }

      try {
        console.log(`Dropping collection: ${collection.name}`);
        await db.collection(collection.name).drop();
      } catch (error: any) {
        if (error.code === 125) {
          console.log(
            `  Warning: Cannot drop ${collection.name} (time-series collection), will be overwritten`
          );
        } else {
          throw error;
        }
      }
    }
    console.log("All user collections dropped");

    console.log("\n=== Creating Necessary Collections ===");

    // 1. Booking Analytics Collection
    console.log("Creating booking_analytics collection...");
    await db.createCollection("booking_analytics");
    await db
      .collection("booking_analytics")
      .createIndexes([
        { key: { destination_id: 1, booking_date: 1 }, unique: true },
        { key: { operator_id: 1 } },
        { key: { booking_date: -1 } },
        { key: { updated_at: -1 } },
      ]);
    console.log("✓ booking_analytics created with indexes");

    // 2. Destination Metrics Collection
    console.log("Creating destination_metrics collection...");
    await db.createCollection("destination_metrics");
    await db
      .collection("destination_metrics")
      .createIndexes([
        { key: { destination_id: 1 }, unique: true },
        { key: { operator_id: 1 } },
        { key: { region: 1 } },
        { key: { category: 1 } },
        { key: { trending_score: -1 } },
        { key: { avg_rating: -1 } },
        { key: { occupancy_rate: -1 } },
        { key: { updated_at: -1 } },
      ]);
    console.log("✓ destination_metrics created with indexes");

    // 3. Revenue Metrics Collection
    console.log("Creating revenue_metrics collection...");
    await db.createCollection("revenue_metrics");
    await db
      .collection("revenue_metrics")
      .createIndexes([
        { key: { operator_id: 1, revenue_date: 1 }, unique: true },
        { key: { revenue_date: -1 } },
        { key: { total_revenue: -1 } },
        { key: { updated_at: -1 } },
      ]);
    console.log("✓ revenue_metrics created with indexes");

    // 4. System Metrics Collection
    console.log("Creating system_metrics collection...");
    await db.createCollection("system_metrics");
    await db
      .collection("system_metrics")
      .createIndexes([
        { key: { metric_type: 1 }, unique: true },
        { key: { updated_at: -1 } },
      ]);
    console.log("✓ system_metrics created with indexes");

    console.log("\n=== MongoDB Reset Complete ===");
    console.log("\nCollections created:");
    console.log(
      "  1. booking_analytics - Booking data aggregated by destination and date"
    );
    console.log("  2. destination_metrics - Destination performance metrics");
    console.log(
      "  3. revenue_metrics - Revenue data aggregated by operator and date"
    );
    console.log("  4. system_metrics - Platform-wide system metrics");
  } catch (error) {
    console.error("Error resetting MongoDB:", error);
    throw error;
  } finally {
    await client.close();
    console.log("\nMongoDB connection closed");
  }
}

resetMongoDB()
  .then(() => {
    console.log("\n✓ MongoDB reset successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ MongoDB reset failed:", error);
    process.exit(1);
  });
