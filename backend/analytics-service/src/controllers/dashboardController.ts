import { Request, Response } from "express";
import { getMongoDb } from "../config/mongodb";

export const getOperatorDashboard = async (req: Request, res: Response) => {
  try {
    const { operatorId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    const db = getMongoDb();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const operatorIdNum = parseInt(operatorId);

    const [bookings, destinations, revenue] = await Promise.all([
      db
        .collection("booking_analytics")
        .find({
          operator_id: operatorIdNum,
          date: { $gte: startDate },
        })
        .toArray(),

      db
        .collection("destination_metrics")
        .find({ operator_id: operatorIdNum })
        .toArray(),

      db
        .collection("revenue_metrics")
        .find({
          operator_id: operatorIdNum,
          date: { $gte: startDate },
        })
        .toArray(),
    ]);

    const totalRevenue = revenue.reduce(
      (sum: number, r: any) => sum + (r.total_revenue || 0),
      0
    );
    const totalBookings = bookings.reduce(
      (sum: number, b: any) => sum + (b.booking_count || 0),
      0
    );
    const avgRating =
      destinations.length > 0
        ? destinations.reduce(
            (sum: number, d: any) => sum + (d.avg_rating || 0),
            0
          ) / destinations.length
        : 0;

    const revenueByDate = revenue.reduce(
      (acc: Record<string, number>, r: any) => {
        const dateKey = r.date.toISOString().split("T")[0];
        acc[dateKey] = (acc[dateKey] || 0) + (r.total_revenue || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    const revenueTrend = Object.entries(revenueByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topDestinations = destinations
      .sort(
        (a: any, b: any) => (b.total_bookings || 0) - (a.total_bookings || 0)
      )
      .slice(0, 5)
      .map((d: any) => ({
        name: d.destination_name,
        bookings: d.total_bookings || 0,
        revenue: d.total_revenue || 0,
      }));

    const bookingsByDate = bookings.reduce(
      (acc: Record<string, number>, b: any) => {
        const dateKey = b.date.toISOString().split("T")[0];
        acc[dateKey] = (acc[dateKey] || 0) + (b.booking_count || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    const weeklyBookings = Object.entries(bookingsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalBookings,
          totalDestinations: destinations.length,
          avgRating: Math.round(avgRating * 10) / 10,
        },
        revenueTrend,
        topDestinations,
        weeklyBookings,
      },
    });
  } catch (error: any) {
    console.error("Error fetching operator dashboard:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch operator dashboard data",
    });
  }
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const db = getMongoDb();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [bookings, revenue, systemMetrics] = await Promise.all([
      db
        .collection("booking_analytics")
        .find({ date: { $gte: startDate } })
        .toArray(),

      db
        .collection("revenue_metrics")
        .find({ date: { $gte: startDate } })
        .toArray(),

      db
        .collection("system_metrics")
        .find({})
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray(),
    ]);

    const totalRevenue = revenue.reduce(
      (sum: number, r: any) => sum + (r.total_revenue || 0),
      0
    );
    const totalBookings = bookings.reduce(
      (sum: number, b: any) => sum + (b.booking_count || 0),
      0
    );

    const metrics = systemMetrics[0] || {
      total_operators: 0,
      total_users: 0,
      total_destinations: 0,
    };

    const revenueByDate = revenue.reduce(
      (acc: Record<string, number>, r: any) => {
        const dateKey = r.date.toISOString().split("T")[0];
        acc[dateKey] = (acc[dateKey] || 0) + (r.total_revenue || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    const revenueTrend = Object.entries(revenueByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const bookingsByDate = bookings.reduce(
      (acc: Record<string, number>, b: any) => {
        const dateKey = b.date.toISOString().split("T")[0];
        acc[dateKey] = (acc[dateKey] || 0) + (b.booking_count || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    const bookingsTrend = Object.entries(bookingsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const operatorRevenue = revenue.reduce(
      (
        acc: Record<number, { operator_id: number; revenue: number }>,
        r: any
      ) => {
        const opId = r.operator_id;
        if (!acc[opId]) {
          acc[opId] = { operator_id: opId, revenue: 0 };
        }
        acc[opId].revenue += r.total_revenue || 0;
        return acc;
      },
      {} as Record<number, { operator_id: number; revenue: number }>
    );

    const topOperators = Object.values(operatorRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((op) => ({
        operator: `Operator ${op.operator_id}`,
        revenue: Math.round(op.revenue * 100) / 100,
      }));

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalBookings,
          totalOperators: metrics.total_operators || 0,
          totalUsers: metrics.total_users || 0,
        },
        revenueTrend,
        bookingsTrend,
        topOperators,
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch admin dashboard data",
    });
  }
};
