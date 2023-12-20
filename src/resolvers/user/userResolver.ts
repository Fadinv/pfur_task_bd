import {Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver} from 'type-graphql';
import {MyContext} from 'src/Types';
import {User} from '../../entities/User';
import {RegistryErrorsCodes, LoginErrorsCodes} from '../user/types';
import argon2 from 'argon2';

@InputType()
class LoginFields {
	@Field()
	email: string;
	@Field()
	password: string;
}

@InputType()
class RegistryFields {
	@Field()
	password: string;
	@Field()
	email: string;
	@Field()
	name?: string;
	@Field()
	phone?: string;
	@Field()
	isAdmin?: boolean;
}

@ObjectType()
class FieldError {
	@Field()
	field: string;
	@Field()
	message: string;
	@Field()
	errorCode: number;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], {nullable: true})
	errors?: FieldError[];
	@Field(() => User, {nullable: true})
	user?: User;
}

@Resolver()
export class UserResolver {
	@Query(() => User, {nullable: true})
	async getMe(
		@Ctx() {em, req}: MyContext,
	) {
		if (!req.session.userId) return null;
		// const user = await em.fork().findOne(User, {id: +req.session.userId}, {populate: true});
		// console.log('user', user?.books);
		// return user;
		return em.fork().findOne(User, {id: +req.session.userId}, {populate: true});
	}

	@Query(() => [User], {nullable: true})
	async getAllUsers(
		@Ctx() {em}: MyContext,
	) {
		return em.fork().find(User, {});
	}

	@Mutation(() => UserResponse)
	async registry(
		@Ctx() {em}: MyContext,
		@Arg('options') options: RegistryFields,
	): Promise<UserResponse> {
		const {password, email, phone, name, isAdmin} = options;
		const fork = em.fork();

		const errors: FieldError[] = [];

		const findUser = await fork.findOne(User, {email});

		if (!email?.length || !email.includes('@')) {
			errors.push({
				field: 'email',
				message: 'Invalid email',
				errorCode: RegistryErrorsCodes.invalidEmail,
			});
		}

		if (!!findUser) {
			errors.push({
				field: 'email',
				message: 'user has already exist',
				errorCode: RegistryErrorsCodes.userHasAlreadyExist,
			});
		}

		if (password.length < 8) {
			errors.push({
				field: 'password',
				message: 'Password must be greater than or equal to 8 characters',
				errorCode: RegistryErrorsCodes.invalidPassword,
			});
		}

		if (errors.length) return {errors};
		const hashPassword = await argon2.hash(password);
		const user = fork.create(User, {name, password: hashPassword, email, phone, isAdmin: isAdmin ?? false});
		await fork.persistAndFlush(user);

		return {user};
	}

	@Mutation(() => UserResponse)
	async updateStudent(
		@Ctx() {em}: MyContext,
		@Arg('options') options: RegistryFields,
	): Promise<UserResponse> {
		const {password, email, phone, name, isAdmin} = options;
		const fork = em.fork();

		const errors: FieldError[] = [];

		const findUser = await fork.findOne(User, {email});

		if (!email?.length || !email.includes('@')) {
			errors.push({
				field: 'email',
				message: 'Invalid email',
				errorCode: RegistryErrorsCodes.invalidEmail,
			});
		}

		if (!findUser) {
			errors.push({
				field: 'email',
				message: 'user is not exist',
				errorCode: RegistryErrorsCodes.userHasAlreadyExist,
			});
		}

		if (password && password.length < 8) {
			errors.push({
				field: 'password',
				message: 'Password must be greater than or equal to 8 characters',
				errorCode: RegistryErrorsCodes.invalidPassword,
			});
		}

		if (errors.length || !findUser) return {errors};
		if (password) {
			const hashPassword = await argon2.hash(password);
			await fork.nativeUpdate(User, {id: findUser.id, name, password: hashPassword, email, phone, isAdmin: isAdmin ?? false}, findUser);
		} else {
			await fork.nativeUpdate(User, {id: findUser.id, name, email, phone, isAdmin: isAdmin ?? false}, findUser);
		}

		return {user: findUser};
	}

	@Mutation(() => Boolean)
	async logout(
		@Ctx() {req}: MyContext,
	) {
		if (!req.session.userId) return false;
		req.session.userId = undefined;
		return true;
	}

	@Mutation(() => UserResponse, {nullable: true})
	async login(
		@Ctx() {em, req}: MyContext,
		@Arg('options') options: LoginFields,
	): Promise<UserResponse> {
		const fork = em.fork();
		const {password, email} = options;

		const errors: FieldError[] = [];

		if (!email?.length || !email.includes('@')) {
			errors.push({
				field: 'email',
				message: 'Invalid email',
				errorCode: RegistryErrorsCodes.invalidEmail,
			});
		}

		const user = await fork.findOne(User, {email});
		if (!user) {
			return {
				errors: [...errors, {
					field: 'inputData',
					message: 'Invalid inputs data',
					errorCode: LoginErrorsCodes.invalidInputData,
				}],
			};
		}

		const isValid = await argon2.verify(user.password, password);

		if (!isValid) {
			return {
				errors: [...errors, {
					field: 'inputData',
					message: 'Invalid inputs data',
					errorCode: LoginErrorsCodes.invalidInputData,
				}],
			};
		}
		req.session.userId = String(user.id);

		return {user};
	}
}