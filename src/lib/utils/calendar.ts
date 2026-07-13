/**
 * Generate a Google Calendar "Add to Calendar" URL
 * using the public action=TEMPLATE approach (no OAuth/API key needed).
 *
 * Google format: YYYYMMDDTHHmmSSZ (UTC ISO 8601 basic)
 * ponytail: uses UTC — fine as long as started_at is stored as TIMESTAMPTZ.
 * If we ever add user-configurable timezones, convert to their tz first.
 */
export function generateGoogleCalendarUrl({
  title,
  description,
  location,
  startedAt,
  endedAt,
}: {
  title: string;
  description?: string | null;
  location?: string | null;
  startedAt: string;   // ISO string from DB (TIMESTAMPTZ)
  endedAt?: string | null;
}): string {
  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : new Date(start.getTime() + 60 * 60 * 1000);

  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
  });

  if (description) params.set("details", description);
  if (location) params.set("location", location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
