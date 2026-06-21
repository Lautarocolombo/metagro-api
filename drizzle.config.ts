import { drizzle } from 'drizzle-orm/netlify';
import { migrations } from 'drizzle-orm/netlify/migrations';
import * as schema from './schema';

export default {
  connection: process.env.NETLIFY_DATABASE_URL,
  schema,
  migrations,
};
