import { MongoClient, Db } from "mongodb";

let mongoDb: Db;

async function getMongoDb(): Promise<Db> {
  if (!mongoDb) {
    const mongoClient = new MongoClient(
      process.env.MONGODB_URI || "mongodb://localhost:27017"
    );
    await mongoClient.connect();
    mongoDb = mongoClient.db(
      process.env.MONGODB_DATABASE || "tourism_analytics"
    );
  }
  return mongoDb;
}

export class OperatorAnalyticsService {
  async getOperatorOverview(operatorId: number, days: number = 30) {
    const db = await getMongoDb();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [revenueData, destinationStats, recentBookings] = await Promise.all([
      db
        .collection("revenue_metrics")
        .find({
          operator_id: operatorId,
          revenue_date: { $gte: startDate },
        })
        .sort({ revenue_date: 1 })
        .toArray(),

      db
        .collection("destination_metrics")
        .find({ operator_id: operatorId })
        .toArray(),

      db
        .collection("booking_analytics")
        .find({
          operator_id: operatorId,
          booking_date: { $gte: startDate },
        })
        .sort({ booking_date: -1 })
        .limit(100)
        .toArray(),
    ]);

    const totalRevenue = revenueData.reduce(
      (sum, day) => sum + (day.total_revenue || 0),
      0
    );
    const totalBookings = revenueData.reduce(
      (sum, day) => sum + (day.booking_count || 0),
      0
    );
    const avgBookingValue =
      totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const activeDestinations = destinationStats.filter(
      (d) => d.is_active
    ).length;
    const avgOccupancy =
      destinationStats.length > 0
        ? destinationStats.reduce(
            (sum, d) => sum + (d.occupancy_rate || 0),
            0
          ) / destinationStats.length
        : 0;
    const avgRating =
      destinationStats.length > 0
        ? destinationStats.reduce((sum, d) => sum + (d.avg_rating || 0), 0) /
          destinationStats.length
        : 0;

    const prevPeriodStart = new Date(startDate);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - days);

    const prevRevenue = await db
      .collection("revenue_metrics")
      .find({
        operator_id: operatorId,
        revenue_date: { $gte: prevPeriodStart, $lt: startDate },
      })
      .toArray();

    const prevTotalRevenue = prevRevenue.reduce(
      (sum, day) => sum + (day.total_revenue || 0),
      0
    );
    const revenueGrowth =
      prevTotalRevenue > 0
        ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
        : 0;

    return {
      overview: {
        totalRevenue: totalRevenue.toFixed(2),
        totalBookings,
        avgBookingValue: avgBookingValue.toFixed(2),
        activeDestinations,
        avgOccupancy: avgOccupancy.toFixed(1),
        avgRating: avgRating.toFixed(1),
        revenueGrowth: revenueGrowth.toFixed(1),
      },
      revenueChart: revenueData.map((d) => ({
        date: d.revenue_date,
        revenue: d.total_revenue,
        bookings: d.booking_count,
      })),
      topDestinations: destinationStats
        .sort((a, b) => (b.total_bookings || 0) - (a.total_bookings || 0))
        .slice(0, 5)
        .map((d) => ({
          name: d.name,
          bookings: d.total_bookings,
          revenue: d.total_revenue || 0,
          rating: d.avg_rating,
          occupancy: d.occupancy_rate,
        })),
      bookingTrend: this.aggregateBookingsByWeek(recentBookings),
    };
  }

  async getDestinationPerformance(operatorId: number) {
    const db = await getMongoDb();

    const destinations = await db
      .collection("destination_metrics")
      .find({ operator_id: operatorId })
      .toArray();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const bookingsData = await db
      .collection("booking_analytics")
      .find({
        operator_id: operatorId,
        booking_date: { $gte: startDate },
      })
      .toArray();

    const destinationPerformance = destinations.map((dest) => {
      const destBookings = bookingsData.filter(
        (b) => b.destination_id === dest.destination_id
      );
      const totalBookings = destBookings.reduce(
        (sum, b) => sum + (b.total_bookings || 0),
        0
      );
      const totalRevenue = destBookings.reduce(
        (sum, b) => sum + (b.total_revenue || 0),
        0
      );

      return {
        destination_id: dest.destination_id,
        name: dest.name,
        category: dest.category,
        region: dest.region,
        bookings_30d: totalBookings,
        revenue_30d: totalRevenue,
        occupancy_rate: dest.occupancy_rate,
        avg_rating: dest.avg_rating,
        review_count: dest.review_count,
        trending_score: dest.trending_score,
      };
    });

    return destinationPerformance.sort((a, b) => b.revenue_30d - a.revenue_30d);
  }

  async getRevenueBreakdown(operatorId: number, days: number = 30) {
    const db = await getMongoDb();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await db
      .collection("booking_analytics")
      .find({
        operator_id: operatorId,
        booking_date: { $gte: startDate },
      })
      .toArray();

    const byDestination = new Map();
    const byDate = new Map();

    bookings.forEach((booking) => {
      const destId = booking.destination_id;
      const dateKey = booking.booking_date.toISOString().split("T")[0];

      if (!byDestination.has(destId)) {
        byDestination.set(destId, {
          destination_id: destId,
          destination_name: booking.destination_name,
          revenue: 0,
          bookings: 0,
        });
      }

      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, { date: dateKey, revenue: 0, bookings: 0 });
      }

      const destData = byDestination.get(destId);
      destData.revenue += booking.total_revenue || 0;
      destData.bookings += booking.total_bookings || 0;

      const dateData = byDate.get(dateKey);
      dateData.revenue += booking.total_revenue || 0;
      dateData.bookings += booking.total_bookings || 0;
    });

    return {
      byDestination: Array.from(byDestination.values()).sort(
        (a, b) => b.revenue - a.revenue
      ),
      dailyTrend: Array.from(byDate.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    };
  }

  private aggregateBookingsByWeek(bookings: any[]) {
    const weekData = new Map();

    bookings.forEach((booking) => {
      const date = new Date(booking.booking_date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weekData.has(weekKey)) {
        weekData.set(weekKey, { week: weekKey, bookings: 0, revenue: 0 });
      }

      const data = weekData.get(weekKey);
      data.bookings += booking.total_bookings || 0;
      data.revenue += booking.total_revenue || 0;
    });

    return Array.from(weekData.values()).sort((a, b) =>
      a.week.localeCompare(b.week)
    );
  }
}

export class AdminAnalyticsService {
  async getPlatformOverview(days: number = 30) {
    const db = await getMongoDb();

    const systemMetrics = await db
      .collection("system_metrics")
      .findOne({ metric_type: "platform_overview" });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [revenueData, bookingStats, destinationStats] = await Promise.all([
      db
        .collection("revenue_metrics")
        .aggregate([
          { $match: { revenue_date: { $gte: startDate } } },
          {
            $group: {
              _id: "$revenue_date",
              total_revenue: { $sum: "$total_revenue" },
              total_bookings: { $sum: "$booking_count" },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),

      db
        .collection("booking_analytics")
        .aggregate([
          { $match: { booking_date: { $gte: startDate } } },
          {
            $group: {
              _id: null,
              total_bookings: { $sum: "$total_bookings" },
              confirmed: { $sum: "$confirmed_bookings" },
              cancelled: { $sum: "$cancelled_bookings" },
            },
          },
        ])
        .toArray(),

      db.collection("destination_metrics").find({}).toArray(),
    ]);

    const totalRevenue = revenueData.reduce(
      (sum, d) => sum + d.total_revenue,
      0
    );
    const totalBookings = revenueData.reduce(
      (sum, d) => sum + d.total_bookings,
      0
    );

    const bookingData = bookingStats[0] || {
      total_bookings: 0,
      confirmed: 0,
      cancelled: 0,
    };
    const conversionRate =
      bookingData.total_bookings > 0
        ? (bookingData.confirmed / bookingData.total_bookings) * 100
        : 0;

    const avgOccupancy =
      destinationStats.length > 0
        ? destinationStats.reduce(
            (sum, d) => sum + (d.occupancy_rate || 0),
            0
          ) / destinationStats.length
        : 0;

    return {
      overview: {
        totalRevenue: totalRevenue.toFixed(2),
        totalBookings: bookingData.total_bookings,
        activeDestinations: systemMetrics?.active_destinations || 0,
        totalOperators: systemMetrics?.total_operators || 0,
        uniqueCustomers: systemMetrics?.unique_customers || 0,
        platformRating: systemMetrics?.platform_avg_rating?.toFixed(1) || "0.0",
        conversionRate: conversionRate.toFixed(1),
        avgOccupancy: avgOccupancy.toFixed(1),
      },
      revenueChart: revenueData.map((d) => ({
        date: d._id,
        revenue: d.total_revenue,
        bookings: d.total_bookings,
      })),
      topDestinations: destinationStats
        .sort((a, b) => (b.total_bookings || 0) - (a.total_bookings || 0))
        .slice(0, 10)
        .map((d) => ({
          name: d.name,
          category: d.category,
          region: d.region,
          bookings: d.total_bookings,
          rating: d.avg_rating,
          occupancy: d.occupancy_rate,
        })),
      categoryDistribution: this.aggregateByCategory(destinationStats),
      regionDistribution: this.aggregateByRegion(destinationStats),
    };
  }

  async getOperatorPerformance() {
    const db = await getMongoDb();

    const operatorData = await db
      .collection("destination_metrics")
      .aggregate([
        { $match: { operator_id: { $ne: null } } },
        {
          $group: {
            _id: "$operator_id",
            destinations: { $sum: 1 },
            total_bookings: { $sum: "$total_bookings" },
            avg_rating: { $avg: "$avg_rating" },
            avg_occupancy: { $avg: "$occupancy_rate" },
          },
        },
        { $sort: { total_bookings: -1 } },
      ])
      .toArray();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const revenueData = await db
      .collection("revenue_metrics")
      .aggregate([
        { $match: { revenue_date: { $gte: startDate } } },
        {
          $group: {
            _id: "$operator_id",
            revenue_30d: { $sum: "$total_revenue" },
          },
        },
      ])
      .toArray();

    const revenueMap = new Map(revenueData.map((r) => [r._id, r.revenue_30d]));

    return operatorData.map((op) => ({
      operator_id: op._id,
      destinations: op.destinations,
      total_bookings: op.total_bookings,
      revenue_30d: revenueMap.get(op._id) || 0,
      avg_rating: op.avg_rating?.toFixed(1) || "0.0",
      avg_occupancy: op.avg_occupancy?.toFixed(1) || "0.0",
    }));
  }

  private aggregateByCategory(destinations: any[]) {
    const categoryMap = new Map();

    destinations.forEach((dest) => {
      const category = dest.category || "Other";
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { category, count: 0, bookings: 0 });
      }
      const data = categoryMap.get(category);
      data.count++;
      data.bookings += dest.total_bookings || 0;
    });

    return Array.from(categoryMap.values()).sort(
      (a, b) => b.bookings - a.bookings
    );
  }

  private aggregateByRegion(destinations: any[]) {
    const regionMap = new Map();

    destinations.forEach((dest) => {
      const region = dest.region || "Other";
      if (!regionMap.has(region)) {
        regionMap.set(region, { region, count: 0, bookings: 0 });
      }
      const data = regionMap.get(region);
      data.count++;
      data.bookings += dest.total_bookings || 0;
    });

    return Array.from(regionMap.values()).sort(
      (a, b) => b.bookings - a.bookings
    );
  }
}
