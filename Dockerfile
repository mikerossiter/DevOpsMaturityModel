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

# Expose the port the app runs on
EXPOSE 3131
	
# Start the application
CMD ["npm", "start"]
