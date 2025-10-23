import { query } from "../services/db";

/**
 * Filter Criteria Interface
 * Defines all possible filtering parameters
 */
export interface FilterCriteria {
  // Text search
  searchQuery?: string;

  // Basic filters
  status?: string;
  availability?: "Full" | "Available";
  date?: string;

  // Advanced filters
  regions?: string[];
  categories?: string[];
  subcategory?: string;
  priceRange?: string | { min: number; max: number };
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];

  // Rating filter
  minRating?: number;
  maxRating?: number;
  minReviews?: number;

  // Availability filters
  availableFrom?: Date;
  availableTo?: Date;

  // Environment filters
  isIndoor?: boolean;
  isOutdoor?: boolean;

  // Accessibility filters
  requiresAccessibility?: boolean;
  wheelchairAccessible?: boolean;
  parkingAvailable?: boolean;
  publicTransportNearby?: boolean;

  // Activity type filters
  indoor?: boolean;
  outdoor?: boolean;
  familyFriendly?: boolean;
  petFriendly?: boolean;

  // Capacity filter
  minCapacity?: number;

  // Trending filter
  trendingOnly?: boolean;

  // Seasonal filter
  seasonalAvailability?: string;

  // Sorting
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  // Pagination
  page?: number;
  limit?: number;
}

/**
 * Advanced Filter Service
 * Handles complex multi-criteria filtering with performance optimization
 */
export class AdvancedFilterService {
  /**
   * Apply advanced filters to destinations
   * Uses dynamic SQL generation with proper parameterization
   */
  async filterDestinations(filters: FilterCriteria) {
    // Base query with essential fields and joins for occupancy calculation
    let sql = `
      SELECT 
        d.destination_id, 
        d.name, 
        ST_AsText(d.location) AS location,
        d.capacity, 
        COALESCE(b.total_visitors, 0) AS current_visitors,
        d.created_at, 
        d.updated_at, 
        d.photos, 
        d.description, 
        d.status,
        d.region,
        d.category,
        d.subcategory,
        d.tags,
        d.price_range,
        d.estimated_cost,
        d.rating,
        d.review_count,
        d.trending_score,
        d.accessibility_features,
        d.wheelchair_accessible,
        d.indoor,
        d.outdoor,
        d.family_friendly,
        d.pet_friendly,
        d.seasonal_availability
      FROM dest.destinations d 
      LEFT JOIN (
        SELECT 
          oi.destination_id, 
          SUM(bk.visitor_count) AS total_visitors 
        FROM dest.bookings bk
        JOIN dest.offers o ON bk.offer_id = o.offer_id
        JOIN dest.offer_items oi ON o.offer_id = oi.offer_id
        WHERE bk.status = 'confirmed' 
          AND DATE(bk.booking_date) = $1
        GROUP BY oi.destination_id
      ) b ON d.destination_id = b.destination_id
    `;

    // Parse date parameter
    const dateParam = this.parseDateParam(filters.date);
    const params: any[] = [dateParam];
    const whereConditions: string[] = [];

    // Build WHERE conditions dynamically

    // Status filter
    if (filters.status) {
      params.push(filters.status);
      whereConditions.push(`d.status = $${params.length}`);
    }

    // Region filter (array support)
    if (filters.regions && filters.regions.length > 0) {
      params.push(filters.regions);
      whereConditions.push(`d.region = ANY($${params.length})`);
    }

    // Category filter (array support)
    if (filters.categories && filters.categories.length > 0) {
      params.push(filters.categories);
      whereConditions.push(`d.category = ANY($${params.length})`);
    }

    // Price range filter
    if (filters.priceRange) {
      if (typeof filters.priceRange === "string") {
        // Named price range: 'Free', 'Budget', 'Moderate', 'Premium'
        params.push(filters.priceRange);
        whereConditions.push(`d.price_range = $${params.length}`);
      } else {
        // Numeric range: { min: 0, max: 100 }
        params.push(filters.priceRange.min, filters.priceRange.max);
        whereConditions.push(
          `d.estimated_cost BETWEEN $${params.length - 1} AND $${params.length}`
        );
      }
    }

    // Tag filter (contains any of the specified tags)
    if (filters.tags && filters.tags.length > 0) {
      params.push(filters.tags);
      whereConditions.push(`d.tags && $${params.length}`); // Array overlap operator
    }

    // Rating filter
    if (filters.minRating !== undefined) {
      params.push(filters.minRating);
      whereConditions.push(`d.rating >= $${params.length}`);
    }
    if (filters.maxRating !== undefined) {
      params.push(filters.maxRating);
      whereConditions.push(`d.rating <= $${params.length}`);
    }

    // Accessibility filters
    if (filters.requiresAccessibility) {
      whereConditions.push("d.accessibility_features = true");
    }
    if (filters.wheelchairAccessible) {
      whereConditions.push("d.wheelchair_accessible = true");
    }

    // Activity type filters
    if (filters.indoor !== undefined) {
      whereConditions.push(`d.indoor = ${filters.indoor}`);
    }
    if (filters.outdoor !== undefined) {
      whereConditions.push(`d.outdoor = ${filters.outdoor}`);
    }
    if (filters.familyFriendly !== undefined) {
      whereConditions.push(`d.family_friendly = ${filters.familyFriendly}`);
    }
    if (filters.petFriendly !== undefined) {
      whereConditions.push(`d.pet_friendly = ${filters.petFriendly}`);
    }

    // Seasonal availability filter
    if (filters.seasonalAvailability) {
      params.push(filters.seasonalAvailability);
      whereConditions.push(`d.seasonal_availability = $${params.length}`);
    }

    // Availability condition (Full or Available)
    if (filters.availability === "Full") {
      whereConditions.push("COALESCE(b.total_visitors, 0) >= d.capacity");
    } else if (filters.availability === "Available") {
      whereConditions.push("COALESCE(b.total_visitors, 0) < d.capacity");
    }

    // Append WHERE clause if conditions exist
    if (whereConditions.length > 0) {
      sql += " WHERE " + whereConditions.join(" AND ");
    }

    // Add ORDER BY clause
    const sortBy = this.mapSortField(filters.sortBy || "name");
    const sortOrder = filters.sortOrder === "desc" ? "DESC" : "ASC";
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Add LIMIT and OFFSET for pagination
    const limit = filters.limit || 20;
    const page = filters.page || 1;
    const offset = (page - 1) * limit;

    params.push(limit, offset);
    sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    console.log("Advanced Filter SQL:", sql);
    console.log("Parameters:", params);

    try {
      const results = await query(sql, params);

      // Get total count for pagination (without LIMIT/OFFSET)
      const totalCount = await this.getTotalCount(
        whereConditions,
        params.slice(0, -2)
      );

      return {
        destinations: results,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error: any) {
      console.error("Advanced filter error:", error.message);
      throw error;
    }
  }

  /**
   * Get total count of filtered results (for pagination)
   */
  private async getTotalCount(
    whereConditions: string[],
    params: any[]
  ): Promise<number> {
    let countSql = `
      SELECT COUNT(DISTINCT d.destination_id) as total
      FROM dest.destinations d
    `;

    if (whereConditions.length > 0) {
      countSql += " WHERE " + whereConditions.join(" AND ");
    }

    const result = await query(countSql, params);
    return parseInt(result[0]?.total || "0");
  }

  /**
   * Map sort field names to database columns
   */
  private mapSortField(sortBy: string): string {
    const fieldMap: Record<string, string> = {
      name: "d.name",
      rating: "d.rating",
      price: "d.estimated_cost",
      popularity: "d.trending_score",
      capacity: "d.capacity",
      region: "d.region",
      category: "d.category",
      created: "d.created_at",
    };

    return fieldMap[sortBy.toLowerCase()] || "d.name";
  }

  /**
   * Parse and validate date parameter
   */
  private parseDateParam(dateStr?: string): string {
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    // Default to today's date in NZ timezone
    return new Date().toLocaleDateString("en-CA", {
      timeZone: "Pacific/Auckland",
    });
  }

  /**
   * Get available filter options (for UI dropdowns)
   */
  async getFilterOptions() {
    const categoriesQuery = `
      SELECT DISTINCT category 
      FROM dest.destinations 
      WHERE category IS NOT NULL 
      ORDER BY category
    `;

    const regionsQuery = `
      SELECT DISTINCT region 
      FROM dest.destinations 
      WHERE region IS NOT NULL 
      ORDER BY region
    `;

    const tagsQuery = `
      SELECT DISTINCT unnest(tags) as tag 
      FROM dest.destinations 
      WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
      ORDER BY tag
    `;

    const [categories, regions, tags] = await Promise.all([
      query(categoriesQuery, []),
      query(regionsQuery, []),
      query(tagsQuery, []),
    ]);

    return {
      categories: categories.map((r: any) => r.category),
      regions: regions.map((r: any) => r.region),
      tags: tags.map((r: any) => r.tag),
      priceRanges: ["Free", "Budget", "Moderate", "Premium"],
      ratings: [1, 2, 3, 4, 5],
    };
  }
}
