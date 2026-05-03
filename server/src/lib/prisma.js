const { createClient } = require('@libsql/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const libsql = createClient({
  url: `file:${path.join(__dirname, '../../prisma/dev.db')}`,
});

const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
