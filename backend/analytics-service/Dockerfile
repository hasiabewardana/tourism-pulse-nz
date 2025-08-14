# Use Node.js 22 Alpine LTS as the base image for a lightweight container
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the whole content except Dockerfile to the working directory
COPY . .

# Install dependencies using npm from package.json in the working directory
RUN npm install

# Expose port 3002 for the analytics service to receive incoming requests
EXPOSE 3002

# Run the application using the start script defined in package.json
CMD ["npm", "start"]