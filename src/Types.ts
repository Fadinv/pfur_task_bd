import {Connection, EntityManager, IDatabaseDriver} from '@mikro-orm/core';
import {Express} from 'express';

export interface MyContext {
	em: EntityManager<IDatabaseDriver<Connection>>;
	req: Express['request'];
	res: Express['response'];
}

declare module 'express-session' {
	interface SessionData {
		userId?: string;
	}
}