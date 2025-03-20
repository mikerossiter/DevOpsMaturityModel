# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the GitLab template file into the container
COPY contrib/gitlab.tpl /contrib/gitlab.tpl

# Ensure the database directory exists and set proper permissions
RUN mkdir -p /app/data && chown -R root:root /app/data && chmod -R 777 /app/data

# Create a non-root user and switch to it
RUN addgroup -S dmmgroup && adduser -S dmmuser -G dmmgroup
RUN chown -R dmmuser:dmmgroup /app
USER dmmuser

# Expose the port the app runs on
EXPOSE 3131

# Start the application
CMD ["npm", "start"]
