# frontend/Dockerfile
FROM node:18

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the front-end code
COPY . .

# Expose the port the React dev server uses internally
EXPOSE 3000

# Start the React dev server
CMD ["npm", "start"]
