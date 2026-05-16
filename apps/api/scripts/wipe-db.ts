import prisma from '../src/lib/prisma';
import logger from '../src/lib/logger';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function wipeDatabase() {
  console.log('\x1b[31m%s\x1b[0m', '!!! WARNING: This will permanently DELETE ALL DATA in the database !!!');
  
  rl.question('Are you absolutely sure you want to proceed? (Type "WIPE" to confirm): ', async (answer) => {
    if (answer !== 'WIPE') {
      console.log('Wipe cancelled.');
      process.exit(0);
    }

    logger.info('Wiping database...');

    try {
      // Use raw SQL to truncate all tables in public schema
      const tables = await prisma.$queryRaw<any[]>`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations';
      `;

      for (const { tablename } of tables) {
        logger.info(`Truncating table: ${tablename}`);
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`);
      }

      logger.info('Database wiped successfully.');
      process.exit(0);
    } catch (error: any) {
      logger.error('Wipe failed', { error: error.message });
      process.exit(1);
    }
  });
}

wipeDatabase();
