# ========================================
# Dockerfile for SEO Admin (Multi-stage)
# ========================================
# Production-ready Node.js 20 + Next.js 14
# Optimized for VPS deployment

# ----------------------------------------
# Stage 1: Dependencies
# ----------------------------------------
FROM node:20-alpine AS deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/seo-tools/package.json ./packages/seo-tools/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ----------------------------------------
# Stage 2: Builder
# ----------------------------------------
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY . .

# Generate Prisma Client
RUN cd packages/database && pnpm run db:generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN pnpm run build

# ----------------------------------------
# Stage 3: Runner
# ----------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3100

USER nextjs

EXPOSE 3100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3100/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
