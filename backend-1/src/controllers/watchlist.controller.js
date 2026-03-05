import { prisma } from '../config/db.config.js';

async function addToWatchlist(req, res)
{
	const { movieId, status, rating, notes, userId } = req.body;
	
	const movie = await prisma.movie.findUnique({
		where: {id: movieId}
	});
	
	const existingInWatchlist = await prisma.watchlistItem.findUnique({
		where: { userId_movieId: {
				userId: req.user.id,
				movieId: movieId,
			}
		},
	});
	
	if (existingInWatchlist)
	{
		return res.status(400).json({status: 400, message: 'Movie already in the watchlist'});
	}
	
	const watchlistItem = await prisma.watchlistItem.create({
		data: {
			userId: req.user.id,
			movieId,
			status: status || "PLANNED",
			rating,
			notes,
		}
	});
	
	res.status(201).json({
		status: 201,
		message: "Success",
		data: {
			watchlistItem,
		}
	});
}

export { addToWatchlist };
