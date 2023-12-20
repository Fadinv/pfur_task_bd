import {Arg, Ctx, Mutation, Query, Resolver} from 'type-graphql';
import {Book} from '../../entities/Book';
import {User} from '../../entities/User';
import {MyContext} from '../../Types';

@Resolver()
export class BooksResolver {
	@Query(() => [Book], {nullable: true})
	async getAllBooks(
		@Ctx() {em, req}: MyContext,
	) {
		if (!req.session.userId) return null;
		const fork = em.fork();
		return fork.find(Book, {}, {populate: true});
	}

	@Query(() => [Book], {nullable: true})
	async getBookById(
		@Ctx() {em, req}: MyContext,
		@Arg('bookId') bookId: number,
	) {
		if (!req.session.userId) return null;
		const fork = em.fork();
		return fork.findOne(Book, {id: bookId});
	}

	@Mutation(() => Book, {nullable: true})
	async createBook(
		@Ctx() {em, req}: MyContext,
		@Arg('name') name: string,
		@Arg('imageUrl') imageUrl: string,
		@Arg('count') count: number,
	) {
		const fork = em.fork();
		if (!req.session.userId) return null;
		const book = fork.create(Book, {name, imageUrl, count});
		await fork.persistAndFlush(book);
		return book;
	}

	@Mutation(() => Book, {nullable: true})
	async updateBook(
		@Ctx() {em, req}: MyContext,
		@Arg('bookId') bookId: number,
		@Arg('name') name: string,
		@Arg('imageUrl') imageUrl: string,
		@Arg('count') count: number,
		@Arg('userId') userId: number,
	) {
		const fork = em.fork();
		if (!req.session.userId) return null;
		const user = await fork.findOne(User, {id: userId}, {populate: true});
		const book = await fork.findOne(Book, {id: bookId}, {populate: true});
		if (!book || !user) return null;
		if (user) book.users.add(user);
		else book.users.removeAll();
		// user.books.add(book);
		book.name = name;
		book.imageUrl = imageUrl;
		book.count = count;
		await fork.persistAndFlush(book);
		return book;
	}


	@Mutation(() => Book, {nullable: true})
	async getBookByUser(
		@Ctx() {em, req}: MyContext,
		@Arg('bookId') bookId: number,
	) {
		const fork = em.fork();
		if (!req.session.userId) return null;
		const book = await fork.findOne(Book, {id: bookId});
		const user = await fork.findOne(User, {id: +req.session.userId});
		if (!user || !book) return null;
		book.users.add(user);
		await fork.persistAndFlush(book);
		return book;
	}

	@Mutation(() => Boolean, {nullable: true})
	async deleteBookById(
		@Ctx() {em, req}: MyContext,
		@Arg('bookId') bookId: number,
	): Promise<boolean> {
		const fork = em.fork();
		if (!req.session.userId) return false;
		const me = await fork.findOne(User, {id: +req.session.userId});
		if (me?.isAdmin) {
			await fork.nativeDelete(Book, {id: bookId});
			return true;
		} else {
			return false;
		}
	}
}