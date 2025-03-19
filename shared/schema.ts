import { pgTable, text, serial, integer, boolean, timestamp, numeric, date, varchar, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for user roles
export const userRoleEnum = pgEnum("user_role", ["user", "teacher", "admin"]);

// Enum for question types
export const questionTypeEnum = pgEnum("question_type", ["mcq", "true_false", "fill_in"]);

// Enum for test attempt status
export const attemptStatusEnum = pgEnum("attempt_status", ["in_progress", "completed", "abandoned"]);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  role: userRoleEnum("role").default("user"),
  profileImage: varchar("profile_image", { length: 255 }),
  resetToken: varchar("reset_token", { length: 255 }),
  resetTokenExpires: timestamp("reset_token_expires"),
  createdAt: timestamp("created_at").defaultNow()
});

// Exams Table
export const exams = pgTable("exams", {
  examId: serial("exam_id").primaryKey(),
  examName: varchar("exam_name", { length: 255 }).notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  instructions: text("instructions"),
  publishDate: timestamp("publish_date"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Sections Table
export const sections = pgTable("sections", {
  sectionId: serial("section_id").primaryKey(),
  examId: integer("exam_id").notNull().references(() => exams.examId, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Questions Table
export const questions = pgTable("questions", {
  questionId: serial("question_id").primaryKey(),
  sectionId: integer("section_id").notNull().references(() => sections.sectionId, { onDelete: "cascade" }),
  questionType: questionTypeEnum("question_type").notNull(),
  questionText: text("question_text").notNull(),
  solutionText: text("solution_text"),
  correctAnswer: varchar("correct_answer", { length: 255 }),
  position: integer("position").notNull(),
  marks: numeric("marks", { precision: 5, scale: 2 }).default("1.00"),
  createdAt: timestamp("created_at").defaultNow()
});

// Options Table
export const options = pgTable("options", {
  optionId: serial("option_id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => questions.questionId, { onDelete: "cascade" }),
  optionText: text("option_text").notNull(),
  isCorrect: boolean("is_correct").default(false),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// User Exam Attempts Table
export const userExamAttempts = pgTable("user_exam_attempts", {
  attemptId: serial("attempt_id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  examId: integer("exam_id").notNull().references(() => exams.examId),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  score: numeric("score", { precision: 5, scale: 2 }),
  status: attemptStatusEnum("status").default("in_progress"),
  createdAt: timestamp("created_at").defaultNow()
});

// User Answers Table
export const userAnswers = pgTable("user_answers", {
  answerId: serial("answer_id").primaryKey(),
  attemptId: integer("attempt_id").notNull().references(() => userExamAttempts.attemptId, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questions.questionId),
  userAnswer: text("user_answer"),
  isCorrect: boolean("is_correct"),
  marksObtained: numeric("marks_obtained", { precision: 5, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow()
});

// Notifications Table
export const notifications = pgTable("notifications", {
  notificationId: serial("notification_id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("info"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Sessions Table
export const sessions = pgTable("sessions", {
  sessionId: varchar("session_id", { length: 128 }).notNull().primaryKey(),
  expires: integer("expires").notNull(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Zod schemas for insertions
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  resetToken: true,
  resetTokenExpires: true,
  profileImage: true
});

export const insertExamSchema = createInsertSchema(exams).omit({
  examId: true,
  createdAt: true,
  updatedAt: true
});

export const insertSectionSchema = createInsertSchema(sections).omit({
  sectionId: true,
  createdAt: true
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  questionId: true,
  createdAt: true
});

export const insertOptionSchema = createInsertSchema(options).omit({
  optionId: true,
  createdAt: true
});

export const insertUserExamAttemptSchema = createInsertSchema(userExamAttempts).omit({
  attemptId: true,
  createdAt: true,
  endTime: true,
  score: true
});

export const insertUserAnswerSchema = createInsertSchema(userAnswers).omit({
  answerId: true,
  createdAt: true,
  isCorrect: true,
  marksObtained: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  notificationId: true,
  createdAt: true
});

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;

export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Section = typeof sections.$inferSelect;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertOption = z.infer<typeof insertOptionSchema>;
export type Option = typeof options.$inferSelect;

export type InsertUserExamAttempt = z.infer<typeof insertUserExamAttemptSchema>;
export type UserExamAttempt = typeof userExamAttempts.$inferSelect;

export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
export type UserAnswer = typeof userAnswers.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Extended types for complex operations
export type ExamWithSections = Exam & {
  sections: (Section & {
    questions: (Question & {
      options: Option[];
    })[];
  })[];
};

export type UserAttemptWithAnswers = UserExamAttempt & {
  exam: Exam;
  answers: (UserAnswer & {
    question: Question & {
      options: Option[];
    };
  })[];
};

export type UserWithRole = User & {
  role: 'user' | 'teacher' | 'admin';
};

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export type LoginData = z.infer<typeof loginSchema>;
