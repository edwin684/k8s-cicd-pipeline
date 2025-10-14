# backend/Dockerfile

# 1. Use Node base image
FROM node:18-alpine AS build

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# 4. Copy source code
COPY . .

# 5. Expose the port your backend uses (usually 3000)
EXPOSE 3000

# 6. Start the server
CMD ["npm", "start"]
