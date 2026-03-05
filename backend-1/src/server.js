import 'dotenv/config';
import express from 'express';
import { connectPrisma } from './config/db.config.js';
import { router as movieRoutes } from './routes/movie.routes.js';
import { router as authRoutes } from './routes/auth.routes.js';
import { router as watchlistRoutes } from './routes/watchlist.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/movie', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/watchlist', watchlistRoutes);

const PORT = process.env.PORT || 5001;

(async () => {
	try
	{
		await connectPrisma();
		app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
	}
	catch (error)
	{
		console.error('Server runnig failed: ', error);
		process.exit(1);
	}
})();
