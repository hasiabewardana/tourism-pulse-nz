import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Box, Paper, Typography, useTheme } from "@mui/material";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

// Line Chart Component
export const DemandTrendChart = ({ data, title = "Demand Trends" }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Paper
        sx={{
          p: 2,
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="accommodation"
            stroke="#0088FE"
            strokeWidth={2}
            name="Accommodation"
          />
          <Line
            type="monotone"
            dataKey="activities"
            stroke="#00C49F"
            strokeWidth={2}
            name="Activities"
          />
          <Line
            type="monotone"
            dataKey="transportation"
            stroke="#FFBB28"
            strokeWidth={2}
            name="Transportation"
          />
          <Line
            type="monotone"
            dataKey="restaurants"
            stroke="#FF8042"
            strokeWidth={2}
            name="Restaurants"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

// Bar Chart Component for Staffing
export const StaffingChart = ({ data, title = "Staffing Recommendations" }) => {
  const theme = useTheme();

  if (!data) {
    return (
      <Paper
        sx={{
          p: 2,
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No staffing data available
        </Typography>
      </Paper>
    );
  }

  // Transform staffing data for chart
  const chartData = Object.keys(data).map((department) => ({
    department: department.charAt(0).toUpperCase() + department.slice(1),
    current: data[department].currentStaff || 0,
    recommended: data[department].recommendedStaff || 0,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="department"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
            }}
          />
          <Legend />
          <Bar dataKey="current" fill="#8884d8" name="Current Staff" />
          <Bar dataKey="recommended" fill="#82ca9d" name="Recommended Staff" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

// Pie Chart for Resource Utilization
export const ResourceUtilizationChart = ({
  data,
  title = "Resource Utilization",
}) => {
  const theme = useTheme();

  if (!data) {
    return (
      <Paper
        sx={{
          p: 2,
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No utilization data available
        </Typography>
      </Paper>
    );
  }

  // Transform utilization data for pie chart
  const chartData = [
    { name: "Staff Utilization", value: data.staffUtilization?.current || 0 },
    {
      name: "Equipment",
      value: data.equipmentUtilization
        ? Object.values(data.equipmentUtilization).reduce(
            (sum, val) => sum + val,
            0
          ) / Object.keys(data.equipmentUtilization).length
        : 0,
    },
    {
      name: "Facilities",
      value: data.facilityUtilization
        ? Object.values(data.facilityUtilization).reduce(
            (sum, val) => sum + val,
            0
          ) / Object.keys(data.facilityUtilization).length
        : 0,
    },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

// Seasonal Pattern Visualization
export const SeasonalPatternChart = ({ data, title = "Seasonal Patterns" }) => {
  const theme = useTheme();

  if (!data) {
    return (
      <Paper
        sx={{
          p: 2,
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No seasonal data available
        </Typography>
      </Paper>
    );
  }

  // Transform seasonal data for chart
  const chartData = Object.keys(data).map((season) => ({
    season: season.charAt(0).toUpperCase() + season.slice(1),
    intensity: data[season].intensity || 0,
    months: data[season].months ? data[season].months.length : 0,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="season" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
            }}
          />
          <Bar dataKey="intensity" fill="#8884d8" name="Intensity" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

// Cost Analysis Chart
export const CostAnalysisChart = ({ data, title = "Cost Analysis" }) => {
  const theme = useTheme();

  if (!data) {
    return (
      <Paper
        sx={{
          p: 2,
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No cost data available
        </Typography>
      </Paper>
    );
  }

  const chartData = [
    {
      category: "Current Labor",
      amount: data.currentLaborCosts || 0,
    },
    {
      category: "Recommended Labor",
      amount: data.recommendedLaborCosts || 0,
    },
    {
      category: "Resource Costs",
      amount: data.resourceCosts || 0,
    },
    {
      category: "Potential Savings",
      amount: data.potentialSavings || 0,
    },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
            }}
            formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]}
          />
          <Bar dataKey="amount" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

// Additional Chart Components for UI Integration
export const DemandChart = ({
  data,
  title = "Demand Forecast",
  height = 300,
}) => {
  const sampleData = data || [
    { month: "Jan", forecast: 4000, actual: 3800 },
    { month: "Feb", forecast: 3000, actual: 3200 },
    { month: "Mar", forecast: 5000, actual: 4800 },
    { month: "Apr", forecast: 4500, actual: 4600 },
    { month: "May", forecast: 6000, actual: 5900 },
    { month: "Jun", forecast: 7000, actual: 7200 },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={sampleData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke="#8884d8"
          strokeDasharray="5 5"
        />
        <Line type="monotone" dataKey="actual" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const PeakSeasonChart = ({
  data,
  title = "Peak Season Predictions",
  height = 300,
}) => {
  const sampleData = data || [
    { season: "Summer", prediction: 85, confidence: 92 },
    { season: "Winter", prediction: 65, confidence: 88 },
    { season: "Spring", prediction: 75, confidence: 85 },
    { season: "Autumn", prediction: 70, confidence: 90 },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sampleData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="season" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="prediction" fill="#8884d8" />
        <Bar dataKey="confidence" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const ResourceChart = ({
  data,
  title = "Resource Allocation",
  height = 300,
}) => {
  const sampleData = data || [
    { resource: "Staff", allocated: 80, utilized: 75 },
    { resource: "Facilities", allocated: 90, utilized: 85 },
    { resource: "Equipment", allocated: 70, utilized: 68 },
    { resource: "Transport", allocated: 85, utilized: 82 },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sampleData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="resource" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="allocated" fill="#8884d8" />
        <Bar dataKey="utilized" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const RevenueTrendChart = ({
  data,
  title = "Revenue Trends",
  height = 300,
}) => {
  const sampleData = data || [
    { month: "Jan", revenue: 45000, visitors: 1200 },
    { month: "Feb", revenue: 38000, visitors: 1050 },
    { month: "Mar", revenue: 52000, visitors: 1400 },
    { month: "Apr", revenue: 48000, visitors: 1300 },
    { month: "May", revenue: 60000, visitors: 1600 },
    { month: "Jun", revenue: 72000, visitors: 1900 },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={sampleData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="visitors"
          stroke="#82ca9d"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
