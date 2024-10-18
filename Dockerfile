# Start with the oven/bun image
FROM oven/bun:latest AS builder

# Set environment to production
ENV NODE_ENV=production

# Install dependencies for Node.js
RUN apt-get update && apt-get install -y \
    curl \
    sudo \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - \
    && apt-get install -y nodejs \
    && apt-get clean

# Set the working directory inside the container
WORKDIR /app

# Copy only package files to cache dependencies
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Cache node_modules by creating a layer
RUN cp -R node_modules /tmp/node_modules

# Copy the rest of the project files
COPY . .

# Restore the cached node_modules if available
RUN if [ -d /tmp/node_modules ]; then cp -R /tmp/node_modules/* node_modules/; fi

# Build the project
RUN npm run build

FROM oven/bun:latest AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/bun.lockb /app/bun.lockb

# Expose the necessary ports
EXPOSE 5170
EXPOSE 3001

# Start the application
CMD ["bun", "run", "start"]