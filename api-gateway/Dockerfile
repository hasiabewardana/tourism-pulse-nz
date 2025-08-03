   # Use Node.js 18 Alpine as the base image for a lightweight container
   FROM node:18-alpine

   # Set the working directory inside the container to the service path
   WORKDIR /app/api-gateway

   # Copy the service's package.json to install its listed dependencies
   COPY package.json ./

   # Install dependencies from the monorepo root, using the central node_modules
   RUN npm install --prefix /app/api-gateway

   # Copy all service files into the container, preserving the directory structure
   COPY . .

   # Expose port 3000 for the API gateway to receive incoming requests
   EXPOSE 3000

   # Run the application using the start script defined in package.json
   CMD ["npm", "start"]