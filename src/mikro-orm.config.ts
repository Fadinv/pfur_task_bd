import path from 'path';
import {PostgreSqlDriver} from '@mikro-orm/postgresql';
import {Options} from '@mikro-orm/core';
import {Book} from './entities/Book';
import {User} from './entities/User';

export default {
	entities: [User, Book],
	migrations: {
		path: path.join(__dirname, './migrations'),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	dbName: 'postgres',
	type: 'postgresql',
	host: 'localhost',
	port: 55000,
	password: 'password',
} as Options<PostgreSqlDriver>;