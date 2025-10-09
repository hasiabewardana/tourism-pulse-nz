import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DATABASE || "tourism_analytics";

async function initializeCollections() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);

    const collections = [
      {
        name: "booking_analytics",
        indexes: [
          { key: { destination_id: 1, booking_date: -1 }, unique: false },
          { key: { operator_id: 1, booking_date: -1 }, unique: false },
          { key: { booking_date: -1 }, unique: false },
        ],
      },
      {
        name: "destination_metrics",
        indexes: [
          { key: { destination_id: 1 }, unique: true },
          { key: { operator_id: 1 }, unique: false },
          { key: { is_active: 1 }, unique: false },
        ],
      },
      {
        name: "revenue_metrics",
        indexes: [
          { key: { operator_id: 1, revenue_date: -1 }, unique: false },
          { key: { revenue_date: -1 }, unique: false },
        ],
      },
      {
        name: "system_metrics",
        indexes: [{ key: { metric_type: 1 }, unique: true }],
      },
    ];

    for (const col of collections) {
      const exists = await db
        .listCollections({ name: col.name })
        .toArray()
        .then((colls) => colls.length > 0);

      if (!exists) {
        await db.createCollection(col.name);
        console.log(`Created collection: ${col.name}`);
      }

      for (const index of col.indexes) {
        await db.collection(col.name).createIndex(index.key as any, {
          unique: index.unique,
        });
        console.log(
          `Created index on ${col.name}: ${JSON.stringify(index.key)}`
        );
      }
    }

    console.log("All collections and indexes initialized successfully");
  } catch (error) {
    console.error("Error initializing collections:", error);
    throw error;
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  initializeCollections()
    .then(() => {
      console.log("Initialization complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Initialization failed:", error);
      process.exit(1);
    });
}

export { initializeCollections };
