# Use Node.js 22 Alpine LTS as the base image for a lightweight container
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Install additional dependencies for server and file handling
RUN npm install express multer

# Copy source code
COPY . .

# Build the React app for production
RUN npm run build

# Copy server.js
COPY server.js .

# Expose port 3006
EXPOSE 3006

# Run the Express server
CMD ["node", "server.js"]