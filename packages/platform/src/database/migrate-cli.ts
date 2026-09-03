import { DEFAULT_LOCAL_DATABASE_URL } from "../config";
import { migrate } from "./migrate";

if (!process.env.DATABASE_URL) {
  if (process.env.APP_ENV === "production")
    throw new Error("DATABASE_URL is required in production");
  process.env.DATABASE_URL = DEFAULT_LOCAL_DATABASE_URL;
}

const argument = process.argv[2];
const mode =
  argument === "reset" || argument === "down" || argument === "initial"
    ? argument
    : "up";
await migrate(mode);
