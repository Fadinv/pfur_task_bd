import { Migration } from '@mikro-orm/migrations';

export class Migration20231220175551 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "book" ("id" serial primary key, "name" varchar(255) not null, "count" int not null, "image_url" varchar(255) not null);');

    this.addSql('create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "is_admin" boolean null default false, "name" varchar(255) null, "email" varchar(255) not null, "phone" varchar(255) null, "password" varchar(255) not null);');

    this.addSql('create table "user_books" ("id" serial primary key, "user_id" int not null, "book_id" int not null);');

    this.addSql('alter table "user_books" add constraint "user_books_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "user_books" add constraint "user_books_book_id_foreign" foreign key ("book_id") references "book" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user_books" drop constraint "user_books_book_id_foreign";');

    this.addSql('alter table "user_books" drop constraint "user_books_user_id_foreign";');

    this.addSql('drop table if exists "book" cascade;');

    this.addSql('drop table if exists "user" cascade;');

    this.addSql('drop table if exists "user_books" cascade;');
  }

}
