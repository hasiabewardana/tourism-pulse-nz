// src/shared/pages/common/About.js
import React from "react";
import {
  Typography,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import classes from "./About.module.css";

function About() {
  const keyFeatures = [
    {
      icon: "📊",
      title: "Real-time Data Dashboard",
      description:
        "Interactive dashboard displaying real-time visitor statistics and trends with filters for region, time, and visitor type.",
    },
    {
      icon: "🔮",
      title: "Predictive Analytics Module",
      description:
        "Advanced forecasting tools to predict peak seasons and demand patterns for effective capacity planning and resource allocation.",
    },
    {
      icon: "🗺️",
      title: "Interactive Regional Map",
      description:
        "Visual mapping system highlighting regional hotspots with real-time capacity indicators and alternative destination suggestions.",
    },
    {
      icon: "👥",
      title: "User Authentication & Roles",
      description:
        "Secure role-based access system supporting admin, tourism operator, and public user access with appropriate permissions.",
    },
    {
      icon: "🌐",
      title: "API Integration Hub",
      description:
        "Seamless integration with external data sources including OpenWeather, OpenStreetMap, and Stats NZ for comprehensive insights.",
    },
    {
      icon: "📝",
      title: "Feedback & Reporting Tools",
      description:
        "Comprehensive feedback collection system and detailed reporting capabilities for stakeholders and administrators.",
    },
  ];

  const technologies = [
    "React.js 18+",
    "Node.js 18+",
    "TypeScript",
    "Express.js",
    "PostgreSQL 15+",
    "Material-UI (MUI)",
    "Redux Toolkit",
    "Sequelize ORM",
    "JWT Authentication",
    "OpenWeatherMap API",
    "OpenStreetMap API",
    "Docker",
    "nginx",
    "Jest & Cypress",
  ];

  const stakeholders = [
    {
      type: "Tourism Operators",
      benefits: [
        "Real-time visitor capacity monitoring and alerts",
        "Dynamic pricing and booking management tools",
        "Predictive analytics for staffing and resource planning",
        "Coordinated capacity management across multiple destinations",
      ],
    },
    {
      type: "Tourists & Visitors",
      benefits: [
        "Real-time availability information for popular destinations",
        "Personalized recommendations for alternative destinations",
        "Advance planning with capacity-based booking suggestions",
        "Enhanced overall visit experience through better information",
      ],
    },
    {
      type: "System Administrators",
      benefits: [
        "Comprehensive system monitoring and management tools",
        "Data input adjustment and configuration capabilities",
        "Detailed system reports and analytics generation",
        "User management and access control administration",
      ],
    },
    {
      type: "General Public",
      benefits: [
        "Access to public portal for general tourism insights",
        "Transparency in tourism data and destination management",
        "Educational resources about sustainable tourism practices",
        "Community engagement in tourism planning processes",
      ],
    },
  ];

  return (
    <Container maxWidth="lg" className={classes.aboutContainer}>
      {/* Header Section */}
      <Box className={classes.header}>
        <Typography variant="h2" align="center" className={classes.title}>
          TourismPulseNZ
        </Typography>
        <Typography variant="h5" align="center" className={classes.subtitle}>
          A Smart Web-Based Tourism Management Platform
        </Typography>
        <Typography
          variant="body1"
          align="center"
          className={classes.content}
          sx={{ mt: 2, mb: 2 }}
        >
          Addressing New Zealand's over-tourism challenges through data-driven
          visitor flow management
        </Typography>
        <Box className={classes.tags}>
          <Chip label="Real-time Capacity Monitoring" className={classes.tag} />
          <Chip label="Predictive Analytics" className={classes.tag} />
          <Chip label="Sustainable Tourism" className={classes.tag} />
          <Chip label="Web-based Platform" className={classes.tag} />
        </Box>
      </Box>

      {/* Mission & Vision */}
      <Box className={classes.section}>
        <Box className={classes.missionVisionGrid}>
          <Box className={classes.missionVisionItem}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h4" className={classes.sectionTitle}>
                  Our Mission
                </Typography>
                <Typography className={classes.content}>
                  Develop a comprehensive web-based platform that enables
                  sustainable tourism management through real-time data
                  analytics and visitor flow optimization. TourismPulseNZ
                  addresses New Zealand's over-tourism challenges by providing
                  tourism operators with real-time capacity monitoring,
                  predictive analytics, and tourist planning tools to help
                  destinations balance sustainability with visitor satisfaction.
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box className={classes.missionVisionItem}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h4" className={classes.sectionTitle}>
                  Our Vision
                </Typography>
                <Typography className={classes.content}>
                  Address the critical challenge that New Zealand's tourism
                  destinations lack effective real-time capacity management
                  systems, leading to overcrowding, environmental damage, and
                  degraded visitor experiences. With international visitor
                  arrivals increasing by 7% annually and generating $44.4
                  billion in expenditure, there is an urgent need for technology
                  solutions that balance economic benefits with environmental
                  and cultural preservation.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Platform Capabilities */}
      <Box className={classes.section}>
        <Typography
          variant="h3"
          align="center"
          className={classes.sectionTitle}
        >
          Platform Capabilities
        </Typography>
        <Box className={classes.featureGrid}>
          {keyFeatures.map((feature, index) => (
            <Box key={index} className={classes.featureItem}>
              <Card className={classes.featureCard}>
                <CardContent>
                  <Box className={classes.featureIcon}>{feature.icon}</Box>
                  <Typography variant="h6" className={classes.featureTitle}>
                    {feature.title}
                  </Typography>
                  <Typography className={classes.content}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Technical Excellence */}
      <Box className={classes.section}>
        <Typography
          variant="h3"
          align="center"
          className={classes.sectionTitle}
        >
          Technical Excellence
        </Typography>
        <Box className={classes.missionVisionGrid}>
          <Box className={classes.teamMainItem}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h5" className={classes.sectionTitle}>
                  Architecture & Technologies
                </Typography>
                <Typography className={classes.content}>
                  Built using modern web technologies including React.js for the
                  frontend, Node.js with Express.js for the backend, and
                  PostgreSQL for reliable data storage. The platform integrates
                  free public datasets and APIs to provide actionable insights
                  for sustainable tourism management with a focus on scalability
                  and performance.
                </Typography>
                <Box className={classes.techTags}>
                  {technologies.map((tech, index) => (
                    <Chip
                      key={index}
                      label={tech}
                      className={classes.techTag}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box className={classes.teamContactItem}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h6" className={classes.sectionTitle}>
                  🛡️ System Requirements & Security
                </Typography>
                <Box className={classes.securityList}>
                  <Typography className={classes.securityItem}>
                    ✓ System uptime of 99.9% for continuous access
                  </Typography>
                  <Typography className={classes.securityItem}>
                    ✓ Data security compliant with NZ Privacy Act 2020
                  </Typography>
                  <Typography className={classes.securityItem}>
                    ✓ Response time under 2 seconds for dashboard updates
                  </Typography>
                  <Typography className={classes.securityItem}>
                    ✓ Support for 10,000 concurrent users during peak seasons
                  </Typography>
                  <Typography className={classes.securityItem}>
                    ✓ Comprehensive testing with Jest, Cypress, and Lighthouse
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Stakeholder Impact */}
      <Box className={classes.section}>
        <Typography
          variant="h3"
          align="center"
          className={classes.sectionTitle}
        >
          Stakeholder Impact
        </Typography>
        <Box className={classes.stakeholderGrid}>
          {stakeholders.map((stakeholder, index) => (
            <Box key={index} className={classes.stakeholderItem}>
              <Card className={classes.card}>
                <CardContent>
                  <Typography variant="h6" className={classes.stakeholderTitle}>
                    {stakeholder.type}
                  </Typography>
                  <Box className={classes.benefitsList}>
                    {stakeholder.benefits.map((benefit, benefitIndex) => (
                      <Typography
                        key={benefitIndex}
                        className={classes.benefitItem}
                      >
                        • {benefit}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Project Context & Challenges */}
      <Box className={classes.section}>
        <Typography
          variant="h3"
          align="center"
          className={classes.sectionTitle}
        >
          Project Context & Challenges
        </Typography>
        <Card className={classes.card}>
          <CardContent>
            <Box className={classes.missionVisionGrid}>
              <Box className={classes.missionVisionItem}>
                <Typography
                  variant="h5"
                  className={classes.sustainabilityTitle}
                >
                  🚨 Current Challenges
                </Typography>
                <Typography className={classes.content}>
                  New Zealand's tourism industry is experiencing unprecedented
                  growth with several critical issues:
                </Typography>
                <Box className={classes.benefitsList}>
                  <Typography className={classes.benefitItem}>
                    • Infrastructure strain at popular destinations like Milford
                    Sound, Bay of Islands, and Rotorua
                  </Typography>
                  <Typography className={classes.benefitItem}>
                    • Environmental impact threatening fragile ecosystems and
                    cultural sites
                  </Typography>
                  <Typography className={classes.benefitItem}>
                    • Visitor experience degradation due to overcrowding
                  </Typography>
                  <Typography className={classes.benefitItem}>
                    • Tourism operators lacking real-time data and effective
                    capacity management tools
                  </Typography>
                  <Typography className={classes.benefitItem}>
                    • Information asymmetry between tourists and destination
                    capacity
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.missionVisionItem}>
                <Typography
                  variant="h5"
                  className={classes.sustainabilityTitle}
                >
                  📈 Industry Impact
                </Typography>
                <Typography className={classes.content}>
                  The tourism sector's growth presents both opportunities and
                  challenges for New Zealand:
                </Typography>
                <Box className={classes.benefitsList}>
                  <Typography className={classes.benefitItem}>
                    • International visitor arrivals increasing by 7% annually
                  </Typography>
                  <Typography className={classes.benefitItem}>
                    • Tourism expenditure generating $44.4 billion for the
                    economy
                  </Typography>
                  <Typography className={classes.benefitItem}>
                    • Government commitment to sustainable tourism practices by
                    2025
                  </Typography>
                  <Typography className={classes.benefitItem}>
                    • Current reliance on historical data and manual processes
                  </Typography>
                  <Typography className={classes.benefitItem}>
                    • Need for real-time, data-driven decision-making tools
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Team & Development */}
      <Box className={classes.section}>
        <Box className={classes.teamGrid}>
          <Box className={classes.teamMainItem}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h4" className={classes.sectionTitle}>
                  Development Team
                </Typography>
                <Typography className={classes.content}>
                  TourismPulseNZ is developed as part of the Programming Project
                  (COMPX576-25B HAM) for the Master of Information Technology
                  degree at the University of Waikato. This 12-week project
                  represents cutting-edge research in sustainable tourism
                  technology, combining academic rigor with practical solutions
                  for New Zealand's tourism challenges.
                </Typography>
                <Divider className={classes.divider} />
                <Typography variant="h6" className={classes.teamTitle}>
                  Project Lead
                </Typography>
                <Typography className={classes.teamMember}>
                  Hasitha Prasanga Abewardana Houpe Mudiyanselage (Student ID:
                  1664022)
                </Typography>
                <Typography className={classes.teamRole}>
                  Master of Information Technology Candidate
                  <br />
                  School of Computing & Mathematical Sciences
                  <br />
                  University of Waikato, Hamilton, New Zealand
                </Typography>
                <Typography className={classes.teamDescription}>
                  Project Duration: 12 weeks (July - October 2025)
                  <br />
                  Specializing in full-stack web development, data analytics
                  integration, and sustainable tourism technology solutions.
                  This project demonstrates comprehensive skills in modern web
                  technologies and practical problem-solving for New Zealand's
                  tourism industry challenges.
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box className={classes.teamContactItem}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h5" className={classes.sectionTitle}>
                  Connect With Us
                </Typography>
                <Box className={classes.contactInfo}>
                  <Box className={classes.contactItem}>
                    <Typography className={classes.contactLabel}>
                      ✉️ Contact Email
                    </Typography>
                    <Typography className={classes.contactValue}>
                      tourism.pulse.nz@gmail.com
                    </Typography>
                  </Box>
                  <Box className={classes.contactItem}>
                    <Typography className={classes.contactLabel}>
                      🐙 Open Source
                    </Typography>
                    <Typography className={classes.contactValue}>
                      github.com/tourismPulseNZ
                    </Typography>
                  </Box>
                  <Box className={classes.contactItem}>
                    <Typography className={classes.contactLabel}>
                      📍 Location
                    </Typography>
                    <Typography className={classes.contactValue}>
                      Hamilton, Waikato, New Zealand
                    </Typography>
                  </Box>
                  <Box className={classes.contactItem}>
                    <Typography className={classes.contactLabel}>
                      🏛️ Institution
                    </Typography>
                    <Typography className={classes.contactValue}>
                      University of Waikato
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default About;
