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

const desiredUserId = '8b07586c-db36-4a8b-b01e-6391b03f1e94';

const seedEmail = "tarantino@gmail.com";

const movies = [
  {
    title: "Inception",
    overview:
      "A thief who steals corporate secrets through dream-sharing technology.",
    releaseYear: 2010,
    genres: ["Action", "Sci-Fi", "Thriller"],
    runtime: 148,
    posterUrl: "https://example.com/inception.jpg",
    createdBy: desiredUserId,
  },
  {
    title: "The Dark Knight",
    overview: "Batman faces the Joker in a battle for Gotham's soul.",
    releaseYear: 2008,
    genres: ["Action", "Crime", "Drama"],
    runtime: 152,
    posterUrl: "https://example.com/darkknight.jpg",
    createdBy: desiredUserId,
  },
  {
    title: "Pulp Fiction",
    overview: "The lives of two mob hitmen, a boxer, and others intertwine.",
    releaseYear: 1994,
    genres: ["Crime", "Drama"],
    runtime: 154,
    posterUrl: "https://example.com/pulpfiction.jpg",
    createdBy: desiredUserId,
  },
  {
    title: "Interstellar",
    overview: "A team of explorers travel through a wormhole in space.",
    releaseYear: 2014,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    runtime: 169,
    posterUrl: "https://example.com/interstellar.jpg",
    createdBy: desiredUserId,
  },
  {
    title: "The Shawshank Redemption",
    overview: "Two imprisoned men bond over a number of years.",
    releaseYear: 1994,
    genres: ["Drama"],
    runtime: 142,
    posterUrl: "https://example.com/shawshank.jpg",
    createdBy: desiredUserId,
  },
  {
    title: "Fight Club",
    overview:
      "An insomniac office worker and a devil-may-care soapmaker form an underground fight club.",
    releaseYear: 1999,
    genres: ["Drama"],
    runtime: 139,
    posterUrl: "https://example.com/fightclub.jpg",
    createdBy: desiredUserId,
  },
  {
    title: "Forrest Gump",
    overview:
      "The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man.",
    releaseYear: 1994,
    genres: ["Drama", "Romance"],
    runtime: 142,
    posterUrl: "https://example.com/forrestgump.jpg",
    createdBy: desiredUserId,
  },
  {
    title: "The Godfather",
    overview:
      "The aging patriarch of an organized crime dynasty transfers control to his son.",
    releaseYear: 1972,
    genres: ["Crime", "Drama"],
    runtime: 175,
    posterUrl: "https://example.com/godfather.jpg",
    createdBy: desiredUserId,
  },
  {
    title: "Goodfellas",
    overview: "The story of Henry Hill and his life in the mob.",
    releaseYear: 1990,
    genres: ["Biography", "Crime", "Drama"],
    runtime: 146,
    posterUrl: "https://example.com/goodfellas.jpg",
    createdBy: desiredUserId,
  },
];

async function main() {
  console.log("Seeding: user, genres, movies...");

  // 1) Déterminer l'ID utilisateur réel à utiliser (éviter P2002)
  let actualUserId = desiredUserId;

  const userById = await prisma.user.findUnique({ where: { id: desiredUserId } });
  
  if (!userById)
  {
    const userByEmail = await prisma.user.findUnique({ where: { email: seedEmail } });
    if (userByEmail)
    {
      // Il existe un user avec l'email seed@local -> on réutilise son id
      actualUserId = userByEmail.id;
      console.log(`Found existing user by email, using id ${actualUserId}`);
    }
    else {
      // Aucun user trouvé -> on crée avec l'id souhaité
      await prisma.user.create({
        data: {
          id: desiredUserId,
          name: "Seed User",
          email: seedEmail,
          password: "changeme", // uniquement pour seed
        },
      });
      console.log(`Created seed user with id ${desiredUserId}`);
    }
  }
  else
  {
    console.log(`Found existing user by id ${desiredUserId}`);
  }

  // 2) Upsert (create if not exists) tous les genres uniques
  const allGenreNames = Array.from(new Set(movies.flatMap((m) => m.genres || [])));
  await Promise.all(
    allGenreNames.map((name) =>
      prisma.genre.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  console.log(`Upserted ${allGenreNames.length} genres`);

  // 3) Créer les films en connectant les genres
  for (const movie of movies) {
    await prisma.movie.create({
      data: {
        title: movie.title,
        overview: movie.overview,
        releaseYear: movie.releaseYear,
        runtime: movie.runtime,
        posterUrl: movie.posterUrl,
        createdBy: actualUserId, // IMPORTANT : utiliser actualUserId
        genres: {
          connect: (movie.genres || []).map((name) => ({ name })),
        },
      },
    });
    console.log(`Created movie: ${movie.title}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
