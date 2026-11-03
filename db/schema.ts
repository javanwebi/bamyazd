import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const listings = sqliteTable('listings', {
 id: text('id').primaryKey(), userId:text('user_id').notNull(),
 title:text('title').notNull(), deal:text('deal').notNull(), type:text('type').notNull(),
 neighborhood:text('neighborhood').notNull(), area:integer('area').notNull(),
 rooms:integer('rooms').notNull(), year:integer('year').notNull(), floor:integer('floor').notNull(),
 price:integer('price').notNull(), deposit:integer('deposit').notNull(), rent:integer('rent').notNull(),
 description:text('description').notNull(), amenities:text('amenities').notNull(), images:text('images').notNull(),
 ownerName:text('owner_name').notNull(), phone:text('phone').notNull(), address:text('address').notNull(),
 status:text('status').notNull().default('pending'), feedback:text('feedback').notNull().default(''), createdAt:text('created_at').notNull()
});
export const settings=sqliteTable('settings',{key:text('key').primaryKey(),value:text('value').notNull()});
export const uploads=sqliteTable('uploads',{id:text('id').primaryKey(),userId:text('user_id').notNull(),contentType:text('content_type').notNull(),createdAt:text('created_at').notNull()});
