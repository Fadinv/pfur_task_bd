import {Collection, Entity, ManyToMany, PrimaryKey, Property} from '@mikro-orm/core';
import {Field, ObjectType} from 'type-graphql';
import {User} from './User';

@ObjectType()
@Entity()
export class Book {
	@Field(() => Number)
	@PrimaryKey()
	id!: number;

	@Field(() => String)
	@Property({type: 'string'})
	name!: string;

	@Field(() => Number)
	@Property({type: 'number'})
	count!: number;

	@Field(() => String)
	@Property({type: 'string'})
	imageUrl!: string;

	@Field(() => [User], {nullable: false})
	@ManyToMany(() => User, 'books', {fixedOrder: true})
	users = new Collection<User>(this);
}