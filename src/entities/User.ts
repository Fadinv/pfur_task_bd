import {Collection, Entity, ManyToMany, PrimaryKey, Property} from '@mikro-orm/core';
import {Field, ObjectType} from 'type-graphql';
import {Book} from './Book';

@ObjectType()
@Entity()
export class User {
	@Field(() => Number)
	@PrimaryKey()
	id!: number;

	@Field(() => String)
	@Property({type: 'date'})
	createdAt?: Date = new Date();

	@Field(() => String)
	@Property({type: 'date', onUpdate: () => new Date()})
	updatedAt?: Date = new Date();

	@Field(() => Boolean, {nullable: true})
	@Property({type: 'boolean', nullable: true, default: false})
	isAdmin?: boolean;

	@Field(() => String)
	@Property({type: 'string', nullable: true})
	name?: string;

	@Field(() => String)
	@Property({type: 'string'})
	email!: string;

	@Field(() => String)
	@Property({type: 'string', nullable: true})
	phone?: string;

	@Property({type: 'string'})
	password!: string;

	@Field(() => [Book], {nullable: false})
	@ManyToMany(() => Book, undefined, {fixedOrder: true})
	books = new Collection<Book>(this);
}