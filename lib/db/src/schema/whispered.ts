import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const wUsers = pgTable("w_users", {
  id: text("id").primaryKey(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wCouples = pgTable("w_couples", {
  id: text("id").primaryKey(),
  user1Id: text("user1_id").notNull(),
  user2Id: text("user2_id"),
  inviteCode: text("invite_code").notNull().unique(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wMessages = pgTable("w_messages", {
  id: text("id").primaryKey(),
  coupleId: text("couple_id").notNull(),
  senderId: text("sender_id").notNull(),
  content: text("content").notNull(),
  type: text("type").default("text").notNull(),
  mediaUrl: text("media_url"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  editedAt: timestamp("edited_at"),
  seenAt: timestamp("seen_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WUser = typeof wUsers.$inferSelect;
export type WCouple = typeof wCouples.$inferSelect;
export type WMessage = typeof wMessages.$inferSelect;
