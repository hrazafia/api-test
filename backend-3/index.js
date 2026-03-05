import express from 'express';
import morgan from 'morgan';
import { createWriteStream } from 'fs';
import { expressjwt as expressJwt } from 'express-jwt';
import { router as movieRouter } from './movie/index.js';
import { router as loginRouter } from './auth.js';

const app = express();

const accessLogStream = createWriteStream('access.log', { flags: 'a' });

app.use(morgan('common', {
	immediate: true,
	stream: accessLogStream
}));

app.use(express.json());

app.use('/login', loginRouter);
app.use('/movie', expressJwt({ secret: 'secret', algorithms: ['HS256'], requestProperty: 'user' }), movieRouter);

app.use((err, request, response, next) => {
	if (err.name === 'UnauthorizedError')
	{
		response.status(401).json('unauthorized');
	}
	else
	{
		next();
	}
});

app.get('/', (request, response) => {
	response.redirect('/movie');
});

app.listen(8080, () => {
	console.log('Server is listening to http://localhost:8080');
});
