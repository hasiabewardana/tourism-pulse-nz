# Tourism Pulse NZ - Analytics & Predictive Features Implementation

## Overview

This implementation provides comprehensive analytics and predictive features for the Tourism Pulse NZ platform, including:

1. **Demand Forecasting** - AI-powered predictions for tourism demand
2. **Peak Season Prediction** - Seasonal analysis and forecasting
3. **Staffing Analytics** - Optimized staffing recommendations
4. **Resource Planning** - Equipment and facility optimization

## Architecture

### Models

#### 1. Demand Forecast Model (`demandForecastModel.ts`)

- Stores ML-based demand predictions
- Tracks confidence intervals and historical accuracy
- Supports multiple forecast types (daily, weekly, monthly, seasonal)

#### 2. Staffing Analytics Model (`staffingAnalyticsModel.ts`)

- Comprehensive staffing optimization data
- Cost analysis and ROI calculations
- Efficiency metrics tracking

#### 3. Peak Season Prediction Model (`peakSeasonPredictionModel.ts`)

- Seasonal pattern analysis
- Weather and economic factor integration
- Special event impact assessment

### Services

#### 1. Forecasting Service (`forecastingService.ts`)

- **Purpose**: AI-powered demand forecasting and peak season prediction
- **Key Features**:
  - Time series analysis using TensorFlow.js
  - Seasonal decomposition
  - Confidence interval calculations
  - Historical pattern recognition
- **Methods**:
  - `predictDemand()` - Generate demand forecasts
  - `predictPeakSeasons()` - Identify peak tourism periods
  - `analyzeTrends()` - Trend analysis and pattern recognition

#### 2. Staffing Service (`staffingService.ts`)

- **Purpose**: Optimize staffing levels based on demand forecasts
- **Key Features**:
  - Business-type specific configurations
  - Multi-department optimization
  - Cost-benefit analysis
  - ROI calculations
- **Methods**:
  - `calculateStaffingNeeds()` - Determine optimal staffing levels
  - `calculateResourceNeeds()` - Plan equipment and facility requirements
  - `getOptimizationSuggestions()` - Generate improvement recommendations

### Controllers

#### 1. Forecast Controller (`forecastController.ts`)

- **Endpoints**:
  - `POST /v1/forecast/demand` - Generate demand forecast
  - `GET /v1/forecast/peaks/:region/:year` - Get peak season predictions
  - `GET /v1/forecast/trends` - Analyze demand trends
  - `GET /v1/forecast/accuracy` - Forecast accuracy metrics

#### 2. Staffing Controller (`staffingController.ts`)

- **Endpoints**:
  - `POST /v1/staffing/recommendations` - Generate staffing recommendations
  - `GET /v1/staffing/optimization/:businessId` - Get optimization suggestions
  - `GET /v1/staffing/history/:businessId` - Staffing analytics history
  - `POST /v1/staffing/compare` - Compare staffing scenarios
  - `GET /v1/resources/utilization/:businessId` - Resource utilization metrics

## API Usage Examples

### 1. Generate Demand Forecast

```bash
curl -X POST http://localhost:3002/api/analytics/v1/forecast/demand \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Auckland",
    "startDate": "2024-01-01",
    "endDate": "2024-03-31",
    "forecastType": "monthly"
  }'
```

**Response:**

```json
{
  "success": true,
  "forecast": {
    "id": "forecast_id",
    "region": "Auckland",
    "predictedDemand": {
      "accommodation": 750,
      "activities": 600,
      "transportation": 450,
      "restaurants": 900
    },
    "confidenceInterval": {
      "lower": 75,
      "upper": 95,
      "accuracy": 87
    }
  },
  "predictions": [...],
  "seasonalPatterns": {...}
}
```

### 2. Get Peak Season Predictions

```bash
curl http://localhost:3002/api/analytics/v1/forecast/peaks/Auckland/2024
```

**Response:**

```json
{
  "success": true,
  "peakSeasons": [
    {
      "name": "Summer Peak",
      "startDate": "2024-12-01",
      "endDate": "2024-02-28",
      "intensity": "high",
      "predictedVisitors": 1100,
      "confidenceLevel": 85,
      "factors": ["School holidays", "Good weather", "Christmas/New Year"]
    }
  ],
  "recommendations": [...],
  "confidence": 85
}
```

### 3. Generate Staffing Recommendations

```bash
curl -X POST http://localhost:3002/api/analytics/v1/staffing/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "hotel_001",
    "businessType": "hotel",
    "forecastPeriod": {
      "startDate": "2024-01-01",
      "endDate": "2024-03-31"
    },
    "currentMetrics": {
      "averageOccupancy": 75,
      "averageRevenue": 15000,
      "staffCount": 25,
      "operatingHours": 24
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "recommendations": {
    "staffingRecommendations": {
      "frontDesk": {
        "currentStaff": 5,
        "recommendedStaff": 6,
        "peakHours": ["08:00-10:00", "17:00-19:00"]
      },
      "housekeeping": {
        "currentStaff": 10,
        "recommendedStaff": 12,
        "roomsPerHour": 2.5
      }
    },
    "costAnalysis": {
      "currentLaborCosts": 1250000,
      "recommendedLaborCosts": 1375000,
      "potentialSavings": 0,
      "roi": 15.5
    }
  },
  "insights": [...],
  "actionItems": [...]
}
```

## Machine Learning Features

### 1. Time Series Forecasting

- **Algorithm**: LSTM Neural Networks (TensorFlow.js)
- **Features**: Historical visitor data, seasonal patterns, weather factors
- **Output**: Multi-step ahead predictions with confidence intervals

### 2. Seasonal Decomposition

- **Components**: Trend, Seasonality, Irregular variations
- **Purpose**: Identify recurring patterns and anomalies
- **Application**: Peak season prediction and capacity planning

### 3. Optimization Algorithms

- **Staffing Optimization**: Linear programming for cost minimization
- **Resource Allocation**: Multi-objective optimization
- **Scenario Analysis**: Monte Carlo simulations for risk assessment

## Business Intelligence Features

### 1. Dashboard Metrics

- Real-time demand indicators
- Staffing efficiency ratios
- Cost per guest analytics
- Revenue optimization metrics

### 2. Predictive Insights

- 30-90 day demand forecasts
- Seasonal capacity recommendations
- Staff utilization predictions
- Resource requirement planning

### 3. Performance Monitoring

- Forecast accuracy tracking
- Staffing optimization ROI
- Customer satisfaction correlation
- Operational efficiency metrics

## Database Schema

### MongoDB Collections

#### 1. demandforecasts

```javascript
{
  _id: ObjectId,
  region: String,
  dateRange: {
    startDate: Date,
    endDate: Date
  },
  forecastType: String, // 'daily', 'weekly', 'monthly', 'seasonal'
  predictedDemand: {
    accommodation: Number,
    activities: Number,
    transportation: Number,
    restaurants: Number
  },
  confidenceInterval: {
    lower: Number,
    upper: Number,
    accuracy: Number
  },
  trends: {
    direction: String,
    rate: Number,
    seasonality: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. staffinganalytics

```javascript
{
  _id: ObjectId,
  businessId: String,
  businessType: String, // 'hotel', 'restaurant', 'activity_provider', 'transport'
  forecastPeriod: {
    startDate: Date,
    endDate: Date
  },
  staffingRecommendations: {
    frontDesk: {
      currentStaff: Number,
      recommendedStaff: Number,
      peakHours: [String],
      skillsRequired: [String]
    },
    housekeeping: { ... },
    foodService: { ... },
    maintenance: { ... }
  },
  costAnalysis: {
    currentLaborCosts: Number,
    recommendedLaborCosts: Number,
    resourceCosts: Number,
    potentialSavings: Number,
    roi: Number
  },
  efficiencyMetrics: {
    staffUtilization: Number,
    customerSatisfaction: Number,
    operationalEfficiency: Number,
    costPerGuest: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Configuration

### Environment Variables

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/tourismpulsenz_analytics

# Service Configuration
PORT=3002
NODE_ENV=development

# ML Model Settings
TENSORFLOW_BACKEND=cpu
MODEL_UPDATE_INTERVAL=24h

# Business Rules
CAPACITY_THRESHOLD=80
STAFF_UTILIZATION_TARGET=85
FORECAST_HORIZON_DAYS=90
```

### Business Configuration

```typescript
// Hotel Configuration
{
  staffPerRoom: 0.3,
  peakHourMultiplier: 1.5,
  seasonalMultiplier: 1.2,
  departments: ['frontDesk', 'housekeeping', 'maintenance'],
  operatingHours: 24
}

// Restaurant Configuration
{
  staffPerCover: 0.15,
  peakHourMultiplier: 2.0,
  seasonalMultiplier: 1.1,
  departments: ['foodService', 'maintenance'],
  operatingHours: 16
}
```

## Development Notes

### Current Implementation Status

✅ **Completed:**

- Core data models and schemas
- Forecasting service with ML placeholder
- Staffing optimization algorithms
- RESTful API endpoints
- Cost analysis and ROI calculations
- Database integration
- TypeScript compilation

🔄 **In Progress:**

- TensorFlow.js integration (placeholder implemented)
- Historical data integration
- Real-time model training

📋 **Planned:**

- Advanced ML model training
- Real-time data streaming
- A/B testing framework
- Performance monitoring dashboard

### Dependencies Required

```json
{
  "@tensorflow/tfjs-node": "^4.15.0",
  "simple-statistics": "^7.8.3",
  "date-fns": "^2.30.0",
  "express": "^5.1.0",
  "mongoose": "^8.16.5",
  "dotenv": "^16.3.1",
  "ws": "^8.14.2"
}
```

### Manual Setup Steps

1. **Install Dependencies:**

   ```bash
   cd backend/analytics-service
   npm install
   ```

2. **Environment Setup:**

   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Database Initialization:**

   ```bash
   npm run build
   npm start
   ```

4. **Verify Installation:**
   ```bash
   curl http://localhost:3002/api/health
   ```

### Integration Points

#### Frontend Integration

- Analytics dashboard components
- Real-time forecast displays
- Staffing recommendation UI
- Cost analysis visualizations

#### External Services

- Weather API integration
- Economic data feeds
- Tourism statistics APIs
- Event calendar integration

## Testing

### Unit Tests

```bash
npm test
```

### API Testing

```bash
# Test demand forecast
curl -X POST http://localhost:3002/api/analytics/v1/forecast/demand \
  -H "Content-Type: application/json" \
  -d '{"region":"Auckland","startDate":"2024-01-01","endDate":"2024-03-31","forecastType":"monthly"}'

# Test staffing recommendations
curl -X POST http://localhost:3002/api/analytics/v1/staffing/recommendations \
  -H "Content-Type: application/json" \
  -d '{"businessId":"test_001","businessType":"hotel","forecastPeriod":{"startDate":"2024-01-01","endDate":"2024-03-31"},"currentMetrics":{"averageOccupancy":75,"averageRevenue":15000,"staffCount":25,"operatingHours":24}}'
```

### Performance Testing

- Load testing with 1000+ concurrent requests
- Memory usage monitoring
- Database query optimization
- Response time benchmarking

## Production Deployment

### Docker Configuration

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3002
CMD ["npm", "start"]
```

### Monitoring

- Application performance monitoring
- Database query monitoring
- ML model accuracy tracking
- Business metrics dashboards

This implementation provides a robust foundation for analytics and predictive features in the Tourism Pulse NZ platform, with scalable architecture and comprehensive business intelligence capabilities.
