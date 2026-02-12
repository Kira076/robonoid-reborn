//import { PrismaClient } from './generated/prisma/client.js';
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";

const adapter = new PrismaBetterSqlite3({
    database: process.env.DATABASE_URL || "robonoid.db",
    // You can also specify other options here, such as logging or connection pooling
});


export const prisma: PrismaClient = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
});