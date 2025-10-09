import cron from "node-cron";
import { Pool } from "pg";
import { MongoClient, Db } from "mongodb";
import pool from "../services/db";

const pgPool = pool;

let mongoDb: Db;

async function getMongoDb(): Promise<Db> {
  if (!mongoDb) {
    const mongoClient = new MongoClient(
      process.env.MONGODB_URI || "mongodb://localhost:27017"
    );
    await mongoClient.connect();
    mongoDb = mongoClient.db(
      process.env.MONGODB_DATABASE || "tourismpulsenz_analytics"
    );
  }
  return mongoDb;
}

export async function syncBookingsAnalytics() {
  console.log("Starting bookings analytics sync...");
  const db = await getMongoDb();

  const result = await pgPool.query(`
    SELECT 
      oi.destination_id,
      d.name as destination_name,
      od.user_id as operator_id,
      DATE(b.created_at) as booking_date,
      COUNT(DISTINCT b.booking_id) as total_bookings,
      COALESCE(SUM(p.amount), 0) as total_revenue,
      COALESCE(AVG(p.amount), 0) as avg_booking_value,
      COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
      COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings
    FROM dest.bookings b
    JOIN dest.offers o ON b.offer_id = o.offer_id
    JOIN dest.offer_items oi ON o.offer_id = oi.offer_id
    JOIN dest.destinations d ON oi.destination_id = d.destination_id
    LEFT JOIN dest.operator_destinations od ON d.destination_id = od.destination_id
    LEFT JOIN dest.payments p ON b.booking_id = p.booking_id AND p.status = 'succeeded'
    WHERE b.created_at >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY oi.destination_id, d.name, od.user_id, DATE(b.created_at)
  `);

  const operations = result.rows.map((row) => ({
    updateOne: {
      filter: {
        destination_id: row.destination_id,
        booking_date: new Date(row.booking_date),
      },
      update: {
        $set: {
          destination_id: row.destination_id,
          destination_name: row.destination_name,
          operator_id: row.operator_id,
          booking_date: new Date(row.booking_date),
          total_bookings: parseInt(row.total_bookings),
          total_revenue: parseFloat(row.total_revenue || "0"),
          avg_booking_value: parseFloat(row.avg_booking_value || "0"),
          confirmed_bookings: parseInt(row.confirmed_bookings || "0"),
          cancelled_bookings: parseInt(row.cancelled_bookings || "0"),
          updated_at: new Date(),
        },
      },
      upsert: true,
    },
  }));

  if (operations.length > 0) {
    await db.collection("booking_analytics").bulkWrite(operations);
    console.log(`Synced ${operations.length} booking analytics records`);
  }
}

export async function syncDestinationMetrics() {
  console.log("Starting destination metrics sync...");
  const db = await getMongoDb();

  const result = await pgPool.query(`
    SELECT 
      d.destination_id,
      d.name,
      COALESCE(d.category, 'General') as category,
      COALESCE(d.region, 'Unknown') as region,
      CASE WHEN d.status = 'Open' THEN true ELSE false END as is_active,
      od.user_id as operator_id,
      d.current_visitors,
      d.capacity as max_visitors,
      ROUND((d.current_visitors::numeric / NULLIF(d.capacity, 0)) * 100, 2) as occupancy_rate,
      COALESCE(d.trending_score, 0) as trending_score,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.review_id) as review_count,
      0 as total_bookings_all_time
    FROM dest.destinations d
    LEFT JOIN dest.operator_destinations od ON d.destination_id = od.destination_id
    LEFT JOIN dest.reviews r ON d.destination_id = r.destination_id
    GROUP BY d.destination_id, d.name, d.category, d.region, d.status, 
             od.user_id, d.current_visitors, d.capacity, d.trending_score
  `);

  const operations = result.rows.map((row) => ({
    replaceOne: {
      filter: { destination_id: row.destination_id },
      replacement: {
        destination_id: row.destination_id,
        name: row.name,
        category: row.category,
        region: row.region,
        is_active: row.is_active,
        operator_id: row.operator_id,
        current_visitors: row.current_visitors || 0,
        max_visitors: row.max_visitors || 0,
        occupancy_rate: parseFloat(row.occupancy_rate || "0"),
        trending_score: parseFloat(row.trending_score || "0"),
        avg_rating: parseFloat(row.avg_rating || "0"),
        review_count: parseInt(row.review_count || "0"),
        total_bookings: parseInt(row.total_bookings_all_time || "0"),
        updated_at: new Date(),
      },
      upsert: true,
    },
  }));

  if (operations.length > 0) {
    await db.collection("destination_metrics").bulkWrite(operations);
    console.log(`Synced ${operations.length} destination metrics records`);
  }
}

export async function syncRevenueMetrics() {
  console.log("Starting revenue metrics sync...");
  const db = await getMongoDb();

  const result = await pgPool.query(`
    SELECT 
      od.user_id as operator_id,
      DATE(b.created_at) as revenue_date,
      COUNT(DISTINCT b.booking_id) as booking_count,
      COALESCE(SUM(p.amount), 0) as total_revenue,
      COALESCE(AVG(p.amount), 0) as avg_revenue,
      COUNT(DISTINCT oi.destination_id) as destinations_with_bookings
    FROM dest.bookings b
    JOIN dest.offers o ON b.offer_id = o.offer_id
    JOIN dest.offer_items oi ON o.offer_id = oi.offer_id
    JOIN dest.operator_destinations od ON oi.destination_id = od.destination_id
    LEFT JOIN dest.payments p ON b.booking_id = p.booking_id AND p.status = 'succeeded'
    WHERE b.created_at >= CURRENT_DATE - INTERVAL '90 days'
    AND b.status = 'confirmed'
    GROUP BY od.user_id, DATE(b.created_at)
  `);

  const operations = result.rows.map((row) => ({
    updateOne: {
      filter: {
        operator_id: row.operator_id,
        revenue_date: new Date(row.revenue_date),
      },
      update: {
        $set: {
          operator_id: row.operator_id,
          revenue_date: new Date(row.revenue_date),
          booking_count: parseInt(row.booking_count),
          total_revenue: parseFloat(row.total_revenue || "0"),
          avg_revenue: parseFloat(row.avg_revenue || "0"),
          destinations_with_bookings: parseInt(row.destinations_with_bookings),
          updated_at: new Date(),
        },
      },
      upsert: true,
    },
  }));

  if (operations.length > 0) {
    await db.collection("revenue_metrics").bulkWrite(operations);
    console.log(`Synced ${operations.length} revenue metrics records`);
  }
}

export async function syncSystemMetrics() {
  console.log("Starting system metrics sync...");
  const db = await getMongoDb();

  const metrics = await pgPool.query(`
    SELECT 
      (SELECT COUNT(*) FROM dest.destinations WHERE status = 'Open') as active_destinations,
      (SELECT COUNT(*) FROM dest.bookings WHERE created_at >= CURRENT_DATE) as bookings_today,
      (SELECT COUNT(*) FROM dest.bookings WHERE status = 'confirmed') as total_confirmed_bookings,
      (SELECT COALESCE(SUM(p.amount), 0) FROM dest.payments p 
       JOIN dest.bookings b ON p.booking_id = b.booking_id 
       WHERE b.status = 'confirmed' AND p.status = 'succeeded') as total_revenue,
      (SELECT COUNT(DISTINCT user_id) FROM dest.bookings) as unique_customers,
      (SELECT COUNT(DISTINCT user_id) FROM dest.operator_destinations) as total_operators,
      (SELECT AVG(rating) FROM dest.reviews) as platform_avg_rating
  `);

  const row = metrics.rows[0];

  await db.collection("system_metrics").updateOne(
    { metric_type: "platform_overview" },
    {
      $set: {
        metric_type: "platform_overview",
        active_destinations: parseInt(row.active_destinations || "0"),
        bookings_today: parseInt(row.bookings_today || "0"),
        total_confirmed_bookings: parseInt(row.total_confirmed_bookings || "0"),
        total_revenue: parseFloat(row.total_revenue || "0"),
        unique_customers: parseInt(row.unique_customers || "0"),
        total_operators: parseInt(row.total_operators || "0"),
        platform_avg_rating: parseFloat(row.platform_avg_rating || "0"),
        updated_at: new Date(),
      },
    },
    { upsert: true }
  );

  console.log("System metrics synced");
}

export async function clearDummyData() {
  console.log("Clearing dummy data from MongoDB...");
  const db = await getMongoDb();

  await db.collection("booking_analytics").deleteMany({});
  await db.collection("destination_metrics").deleteMany({});
  await db.collection("revenue_metrics").deleteMany({});
  await db.collection("system_metrics").deleteMany({});

  console.log("All analytics collections cleared");
}

export async function performFullSync() {
  try {
    console.log("=== Starting Full Analytics Sync ===");
    await clearDummyData();
    await syncDestinationMetrics();
    await syncBookingsAnalytics();
    await syncRevenueMetrics();
    await syncSystemMetrics();
    console.log("=== Full Analytics Sync Complete ===");
  } catch (error) {
    console.error("Full sync failed:", error);
    throw error;
  }
}

export function startDataSyncJobs() {
  cron.schedule("*/15 * * * *", async () => {
    console.log("Running analytics sync job...");
    try {
      await performFullSync();
    } catch (error) {
      console.error("Analytics sync job failed:", error);
    }
  });

  console.log("Analytics sync job scheduled (every 15 minutes)");
}
