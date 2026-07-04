import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/db';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 BookVault Backend active in [${env.NODE_ENV}] mode on port ${env.PORT}`);
});

// Handle graceful shutdown events
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down BookVault server gracefully...`);
  
  server.close(async () => {
    logger.info('Express HTTP server closed.');
    
    try {
      await prisma.$disconnect();
      logger.info('Prisma Client disconnected database connection.');
      process.exit(0);
    } catch (err: any) {
      logger.error(`Error during DB disconnect: ${err.message}`);
      process.exit(1);
    }
  });

  // Force close after 10s timeout
  setTimeout(() => {
    logger.error('Force closing BookVault backend process due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: any) => {
  logger.error(`Unhandled Promise Rejection: ${reason.message || reason} \nStack: ${reason.stack}`);
});

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Application Exception: ${error.message} \nStack: ${error.stack}`);
  process.exit(1);
});
