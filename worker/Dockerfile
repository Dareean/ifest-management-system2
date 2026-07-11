# ============================================================
# I-FEST Management System — Background Worker
# Deployed on Render as a Cron Job (Docker)
# Processes email queue, KPI reminders, meeting cleanup
# ============================================================
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY index.js ./

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "index.js"]
