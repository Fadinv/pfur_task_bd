import {MikroORM} from '@mikro-orm/core';
import mikroOrmConfig from './mikro-orm.config';
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {BooksResolver} from './resolvers/books/booksResolver';
import {UserResolver} from './resolvers/user/userResolver';
import {MyContext} from 'src/Types';
import {buildSchema} from 'type-graphql';
import session from 'express-session';
import connectRedis from 'connect-redis';
import {createClient} from 'redis';
import cors from 'cors';
// import {Book} from './entities/Book';
// import {User} from './entities/User';

const port = 4000;

const main = async () => {
	const orm = await MikroORM.init(mikroOrmConfig);
	// await orm.em.nativeDelete(User, {});
	// await orm.em.nativeDelete(Book, {});

	await orm.getMigrator().up();

	const app = express();

	const RedisStore = connectRedis(session);
	const redisClient = createClient({legacyMode: true});

	redisClient.on('connect', () => console.log('Connected to Redis!'));
	redisClient.on('error', (err) => console.log('Redis Client Error', err));
	await redisClient.connect();

	app.use(cors({
		credentials: true,
		origin: ['http://localhost:3000', 'http://localhost:3001', 'https://studio.apollographql.com'],
	}));
	app.use(
		session({
			name: 'qid',
			store: new RedisStore({client: redisClient}),
			saveUninitialized: true,
			cookie: {
				maxAge: 1000 * 60 * 60 * 60,
				httpOnly: true,
				// httpOnly: false,
				sameSite: 'lax',
				secure: false,
			},
			resave: false,
			secret: 'keyboard cat',
		}),
	);

	const server = new ApolloServer({
		schema: await buildSchema({
			resolvers: [UserResolver, BooksResolver],
			validate: true,
		}),
		introspection: true,
		context: ({req, res}): MyContext => {
			req.session.save();
			// @ts-ignore
			req.session.isAuth = true;
			return {em: orm.em, req, res};
		},
		csrfPrevention: true,
	});

	const corsOptions = {
		origin: ['http://localhost:3000', 'http://localhost:3001', 'https://studio.apollographql.com'],
	};

	await server.start();
	server.applyMiddleware({app, cors: corsOptions, path: '/graphql'});

	app.use('/songs', express.static(__dirname + '/static/products'));

	app.listen({port}, () => {
		console.log(`🚀 Graphql-server ready at http://localhost:${port}${server.graphqlPath}`);
	});
};

main()
	.catch((err) => console.error('Ошибка при запуске сервера', err));