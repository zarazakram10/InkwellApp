import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "purge expired trash",
  "23 4 * * *",
  internal.documents.purgeExpiredTrash,
  {},
);

export default crons;
