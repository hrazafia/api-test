import express from 'express';
import { addToWatchlist } from '../controllers/watchlist.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, addToWatchlist);

export { router };
