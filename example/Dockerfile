FROM node:8-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY src ./src

# Run app
CMD npm start
