import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StatsNZInsights.css";

// When running services separately without API Gateway, use direct service URLs
const ANALYTICS_SERVICE_URL =
  process.env.REACT_APP_ANALYTICS_URL || "http://localhost:3003";

const StatsNZInsights = () => {
  const [region, setRegion] = useState("auckland");
  const [forecast, setForecast] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const regions = [
    "auckland",
    "wellington",
    "canterbury",
    "otago",
    "bay-of-plenty",
    "waikato",
    "southland",
  ];

  useEffect(() => {
    fetchData();
  }, [region]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [forecastRes, comparisonRes, trendsRes] = await Promise.all([
        axios.get(
          `${ANALYTICS_SERVICE_URL}/analytics-service/api/statsnz/enriched-forecast/${region}`
        ),
        axios.get(
          `${ANALYTICS_SERVICE_URL}/analytics-service/api/statsnz/regional-comparison/${region}`
        ),
        axios.get(
          `${ANALYTICS_SERVICE_URL}/analytics-service/api/statsnz/tourism-trends/${region}?months=6`
        ),
      ]);

      setForecast(forecastRes.data.data);
      setComparison(comparisonRes.data.data);
      setTrends(trendsRes.data.data);
    } catch (err) {
      console.error("Failed to fetch Stats NZ data:", err);
      setError("Failed to load national tourism insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>Loading national tourism insights...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#e74c3c" }}>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="stats-nz-insights">
      <div className="header">
        <h2>National Tourism Insights (Stats NZ)</h2>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="region-select"
        >
          {regions.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1).replace("-", " ")}
            </option>
          ))}
        </select>
      </div>

      {forecast && (
        <div className="insight-card forecast-card">
          <h3>Regional Forecast</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">
                Monthly Arrivals (National Avg)
              </span>
              <span className="stat-value">
                {forecast.nationalMonthlyAverage.toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Growth Rate</span>
              <span className="stat-value growth-positive">
                {forecast.nationalGrowthRate}%
              </span>
            </div>
          </div>
          <div className="recommendation">
            <strong>Recommendation:</strong> {forecast.recommendation}
          </div>
          <div className="top-markets">
            <strong>Top Origin Markets:</strong>
            <div className="market-tags">
              {forecast.topOriginMarkets.map((market, idx) => (
                <span key={idx} className="market-tag">
                  {market}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {comparison && (
        <div className="insight-card comparison-card">
          <h3>Regional Benchmarks</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">National Avg Occupancy</span>
              <span className="stat-value">
                {comparison.nationalAverageOccupancy}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Stay Duration</span>
              <span className="stat-value">
                {comparison.nationalAverageStay} days
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Establishments</span>
              <span className="stat-value">
                {comparison.totalEstablishments}
              </span>
            </div>
          </div>
          <div className="insights-list">
            <strong>Key Insights:</strong>
            <ul>
              {comparison.insights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {trends && trends.trends && (
        <div className="insight-card trends-card">
          <h3>6-Month Trend Analysis</h3>
          <div className="trend-summary">
            <span className="stat-label">Overall Growth:</span>
            <span className="stat-value growth-positive">
              {trends.overallGrowth}%
            </span>
          </div>
          <div className="trends-chart">
            {trends.trends.map((trend, idx) => (
              <div key={idx} className="trend-item">
                <div className="trend-month">{trend.month}</div>
                <div className="trend-bars">
                  <div className="trend-bar">
                    <div className="bar-label">Arrivals</div>
                    <div className="bar-container">
                      <div
                        className="bar-fill arrivals"
                        style={{
                          width: `${
                            (trend.arrivals /
                              Math.max(
                                ...trends.trends.map((t) => t.arrivals)
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="bar-value">
                      {(trend.arrivals / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="trend-bar">
                    <div className="bar-label">Occupancy</div>
                    <div className="bar-container">
                      <div
                        className="bar-fill occupancy"
                        style={{ width: `${trend.occupancyRate}%` }}
                      />
                    </div>
                    <div className="bar-value">{trend.occupancyRate}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="data-source">
        Data source: Stats NZ (Statistics New Zealand)
        {forecast && (
          <span>
            {" "}
            | Last updated:{" "}
            {new Date(forecast.lastUpdated).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsNZInsights;
