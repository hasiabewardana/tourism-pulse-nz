   # Use Node.js 22 Alpine LTS as the base image for a lightweight container
   FROM node:22-alpine

   # Set the working directory inside the container
   WORKDIR /app

   # Copy the whole contents of the current directory into the container's working directory
   COPY . .

   # Install dependencies from the package.json file
   RUN npm install

   # Expose port 3000 for the API gateway to receive incoming requests
   EXPOSE 3000

   # Run the application using the start script defined in package.json
   CMD ["npm", "start"]