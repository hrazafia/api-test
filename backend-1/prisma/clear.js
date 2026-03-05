import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
	host: process.env.DATABASE_HOST || '127.0.0.1',
	port: Number(process.env.DATABASE_PORT || 3306),
	user: process.env.DATABASE_USER || 'root',
	password: process.env.DATABASE_PASSWORD || 'rootpassword',
	database: process.env.DATABASE_NAME || 'database',
	allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

const seedEmail = "tarantino@gmail.com"; // email utilisé pour le seed
const desiredUserId = "bed29a3e-8386-4506-b44b-8fd7fb886c23"; // id souhaité du seed user

async function main() {
  console.log("Selective cleanup: searching seed user...");

  // 1) trouver l'utilisateur seed (par email ou id)
  const userByEmail = await prisma.user.findUnique({ where: { email: seedEmail } });
  const userById = await prisma.user.findUnique({ where: { id: desiredUserId } });
  const actualUserId = userByEmail?.id ?? userById?.id ?? null;

  if (!actualUserId) {
    console.log("Aucun utilisateur seed trouvé (par email ou id). Rien à supprimer.");
    return;
  }

  console.log("Found seed user id:", actualUserId);

  // 2) Supprimer les watchlist items et movies créés par cet utilisateur,
  //    puis supprimer les genres qui n'ont plus de films associés.
  await prisma.$transaction([
    // Supprime les items de watchlist de cet utilisateur (sécurité)
    prisma.watchlistItem.deleteMany({ where: { userId: actualUserId } }),

    // Supprime les films créés par cet utilisateur
    prisma.movie.deleteMany({ where: { createdBy: actualUserId } }),

    // Supprime les genres orphelins (n'ayant aucun film)
    prisma.genre.deleteMany({ where: { movies: { none: {} } } }),

    // Supprime l'utilisateur seed
    prisma.user.deleteMany({ where: { id: actualUserId } }),
  ]);

  console.log("Selective cleanup fini.");
}

main()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
