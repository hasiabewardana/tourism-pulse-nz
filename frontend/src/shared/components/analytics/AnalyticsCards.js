import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Groups,
  AttachMoney,
  Assessment,
  Warning,
  CheckCircle,
  Info,
  Schedule,
} from "@mui/icons-material";

// Key Metrics Dashboard Card
export const MetricsCard = ({
  title,
  value,
  change,
  changeType,
  icon,
  color = "primary",
}) => {
  const getTrendIcon = () => {
    if (changeType === "increase") return <TrendingUp color="success" />;
    if (changeType === "decrease") return <TrendingDown color="error" />;
    return <TrendingFlat color="warning" />;
  };

  const getTrendColor = () => {
    if (changeType === "increase") return "success";
    if (changeType === "decrease") return "error";
    return "warning";
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6" color="textSecondary">
            {title}
          </Typography>
          {icon}
        </Box>
        <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
          {value}
        </Typography>
        {change !== undefined && (
          <Box display="flex" alignItems="center" mt={1}>
            {getTrendIcon()}
            <Typography variant="body2" color={getTrendColor()} ml={0.5}>
              {Math.abs(change)}% from last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Peak Season Card Component
export const PeakSeasonCard = ({ season }) => {
  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case "extreme":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-NZ", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Typography variant="h6" component="h3">
            {season.name}
          </Typography>
          <Chip
            label={season.intensity.toUpperCase()}
            color={getIntensityColor(season.intensity)}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="textSecondary" mb={1}>
          {formatDate(season.startDate)} - {formatDate(season.endDate)}
        </Typography>

        <Box display="flex" alignItems="center" mb={2}>
          <Groups sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="body1">
            {season.predictedVisitors?.toLocaleString()} visitors
          </Typography>
        </Box>

        <Typography variant="body2" color="textSecondary" mb={1}>
          Confidence: {season.confidenceLevel}%
        </Typography>

        <LinearProgress
          variant="determinate"
          value={season.confidenceLevel}
          sx={{ mb: 2, height: 6, borderRadius: 3 }}
        />

        {season.factors && season.factors.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom color="textSecondary">
              Key Factors:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {season.factors.map((factor, index) => (
                <Chip
                  key={index}
                  label={factor}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Staffing Insights Component
export const StaffingInsights = ({ insights }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "high":
        return <Warning color="error" />;
      case "medium":
        return <Info color="warning" />;
      case "positive":
        return <CheckCircle color="success" />;
      default:
        return <Info color="info" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "positive":
        return "success";
      default:
        return "info";
    }
  };

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Staffing Insights
          </Typography>
          <Typography variant="body2" color="textSecondary">
            No insights available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Staffing Insights
        </Typography>
        <List>
          {insights.map((insight, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>{getSeverityIcon(insight.severity)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Alert
                      severity={getSeverityColor(insight.severity)}
                      variant="outlined"
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="subtitle2">
                        {insight.message}
                      </Typography>
                    </Alert>
                  }
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      Impact: {insight.impact}
                    </Typography>
                  }
                />
              </ListItem>
              {index < insights.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

// Action Items Component
export const ActionItems = ({ actionItems, title = "Recommended Actions" }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <Warning />;
      case "medium":
        return <Schedule />;
      case "low":
        return <Info />;
      default:
        return <Info />;
    }
  };

  if (!actionItems || actionItems.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            No action items available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <List>
          {actionItems.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <Chip
                    icon={getPriorityIcon(item.priority)}
                    label={item.priority?.toUpperCase() || "NORMAL"}
                    color={getPriorityColor(item.priority)}
                    size="small"
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" gutterBottom>
                      {item.department && `${item.department.toUpperCase()}: `}
                      {item.action}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Timeline: {item.timeline}
                      </Typography>
                      {item.cost && (
                        <Typography variant="body2" color="textSecondary">
                          Cost: ${item.cost.toLocaleString()}
                        </Typography>
                      )}
                      {item.savings && (
                        <Typography variant="body2" color="success.main">
                          Savings: ${item.savings.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < actionItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

// Cost Summary Component
export const CostSummary = ({ costAnalysis }) => {
  if (!costAnalysis) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cost Analysis
          </Typography>
          <Typography variant="body2" color="textSecondary">
            No cost analysis available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const savings = costAnalysis.potentialSavings || 0;
  const roi = costAnalysis.roi || 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Cost Analysis
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box textAlign="center" p={2}>
              <AttachMoney color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h5" fontWeight="bold" color="primary">
                ${costAnalysis.currentLaborCosts?.toLocaleString() || "0"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Current Labor Costs
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center" p={2}>
              <Assessment color="secondary" sx={{ fontSize: 40 }} />
              <Typography variant="h5" fontWeight="bold" color="secondary">
                ${costAnalysis.recommendedLaborCosts?.toLocaleString() || "0"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Recommended Costs
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center" p={2}>
              <Typography
                variant="h5"
                fontWeight="bold"
                color={savings > 0 ? "success.main" : "text.primary"}
              >
                ${savings.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Potential Savings
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center" p={2}>
              <Typography
                variant="h5"
                fontWeight="bold"
                color={roi > 15 ? "success.main" : "warning.main"}
              >
                {roi.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ROI
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Efficiency Metrics Component
export const EfficiencyMetrics = ({ metrics }) => {
  if (!metrics) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Efficiency Metrics
          </Typography>
          <Typography variant="body2" color="textSecondary">
            No efficiency metrics available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getMetricColor = (value) => {
    if (value >= 80) return "success";
    if (value >= 60) return "warning";
    return "error";
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Efficiency Metrics
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(metrics).map(([key, value]) => (
            <Grid item xs={6} key={key}>
              <Box textAlign="center" p={1}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={`${getMetricColor(value)}.main`}
                >
                  {typeof value === "number" ? `${value}%` : value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={typeof value === "number" ? value : 0}
                  color={getMetricColor(typeof value === "number" ? value : 0)}
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Additional Components for the Analytics Pages
export const DemandForecastCard = ({ forecast }) => {
  if (!forecast) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Demand Forecast
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Next 30 days outlook
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <TrendingUp color="success" />
            <Typography variant="h5">
              +{forecast?.growth || "15"}% expected growth
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const StaffingInsightCard = ({ insights }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Staffing Insights
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Current staffing recommendations
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Groups />
            <Typography variant="body1">
              {insights?.recommendation || "Optimal staffing levels maintained"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const ResourceOptimizationCard = ({ optimization }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resource Optimization
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Current efficiency levels
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Assessment />
            <Typography variant="body1">
              {optimization?.efficiency || "92"}% resource utilization
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const PerformanceMetricCard = ({
  title,
  value,
  change,
  trend,
  timeframe,
}) => {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp color="success" />;
    if (trend === "down") return <TrendingDown color="error" />;
    return <TrendingFlat color="warning" />;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h4">{value}</Typography>
          {getTrendIcon()}
        </Box>
        <Typography variant="body2" color="textSecondary">
          {change} {timeframe}
        </Typography>
      </CardContent>
    </Card>
  );
};

export const TrendAnalysisCard = ({ trends, title }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title || "Trend Analysis"}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Key trend indicators
          </Typography>
          <Box sx={{ mt: 1 }}>
            {Object.entries(trends || {}).map(([key, value], index) => (
              <Box
                key={index}
                display="flex"
                justifyContent="space-between"
                py={0.5}
              >
                <Typography variant="body2">{key}</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const AlertsCard = ({ alerts }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return <Warning color="warning" />;
      case "error":
      case "critical":
        return <Warning color="error" />;
      case "success":
        return <CheckCircle color="success" />;
      default:
        return <Info color="info" />;
    }
  };

  const getAlertSeverity = (type) => {
    switch (type) {
      case "warning":
        return "warning";
      case "error":
      case "critical":
        return "error";
      case "success":
        return "success";
      default:
        return "info";
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          System Alerts
        </Typography>
        <Box sx={{ mt: 2 }}>
          {alerts?.map((alert, index) => (
            <Alert
              key={index}
              severity={getAlertSeverity(alert.type)}
              sx={{ mb: 1 }}
              icon={getAlertIcon(alert.type)}
            >
              {alert.message}
            </Alert>
          )) || (
            <Typography variant="body2" color="textSecondary">
              No alerts at this time
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Peak Season Card for Analytics Dashboard (handles peakSeasons prop)
export const PeakSeasonAnalyticsCard = ({ peakSeasons }) => {
  if (!peakSeasons) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Peak Season Predictions
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Next peak season: Summer 2025
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <TrendingUp color="success" />
              <Typography variant="body1">85% increase expected</Typography>
            </Box>
            <Typography variant="caption" color="textSecondary" mt={1}>
              Based on historical patterns
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Handle if peakSeasons is an array
  if (Array.isArray(peakSeasons) && peakSeasons.length > 0) {
    const nextSeason = peakSeasons[0];
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Peak Season Predictions
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Next: {nextSeason.name || "Upcoming Season"}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <TrendingUp color="success" />
              <Typography variant="body1">
                {nextSeason.growth || "+15"}% increase expected
              </Typography>
            </Box>
            <Typography variant="caption" color="textSecondary" mt={1}>
              Confidence: {nextSeason.confidence || "85"}%
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Handle if peakSeasons is an object
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Peak Season Predictions
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Next: {peakSeasons.nextSeason || "Summer 2025"}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <TrendingUp color="success" />
            <Typography variant="body1">
              {peakSeasons.expectedGrowth || "+85"}% increase expected
            </Typography>
          </Box>
          <Typography variant="caption" color="textSecondary" mt={1}>
            Confidence: {peakSeasons.confidence || "90"}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
