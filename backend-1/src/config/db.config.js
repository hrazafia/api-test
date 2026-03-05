import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
	host: process.env.DATABASE_HOST || '127.0.0.1',
	port: Number(process.env.DATABASE_PORT || 3306),
	user: process.env.DATABASE_USER || 'root',
	password: process.env.DATABASE_PASSWORD || 'rootpassword',
	database: process.env.DATABASE_NAME || 'databse',
	allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

const connectPrisma = async () => {
	try
	{
		await prisma.$connect();
		await prisma.$queryRaw`SELECT 1 as ok`;
		console.log('Database connection successful');	
	}
	catch (error)
	{
		console.error(`Database connection failed: ${error}`);
		process.exit(1);
	}
};


const disconnectPrisma = async () => {
	try
	{
		await prisma.$disconnect();
		console.log('Database connection closed');
	}
	catch (error)
	{
		console.error(`Database disconnection failed: ${error}`);
	}
}

process.once('SIGINT', async () => {
	await disconnectPrisma();
	process.exit(0);
});

process.once('SIGTERM', async () => {
	await disconnectPrisma();
	process.exit(0);
});

export { prisma, connectPrisma, disconnectPrisma };
