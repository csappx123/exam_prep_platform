import { users, exams, sections, questions, options, userExamAttempts, userAnswers, notifications, type User, type InsertUser, type Exam, type InsertExam, type Section, type InsertSection, type Question, type InsertQuestion, type Option, type InsertOption, type UserExamAttempt, type InsertUserExamAttempt, type UserAnswer, type InsertUserAnswer, type Notification, type InsertNotification } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for database storage
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Exam operations
  getExam(examId: number): Promise<Exam | undefined>;
  getAllExams(): Promise<Exam[]>;
  getExamsByUser(userId: number): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(examId: number, examData: Partial<Exam>): Promise<Exam | undefined>;
  deleteExam(examId: number): Promise<boolean>;
  
  // Section operations
  getSectionsByExamId(examId: number): Promise<Section[]>;
  createSection(section: InsertSection): Promise<Section>;
  updateSection(sectionId: number, sectionData: Partial<Section>): Promise<Section | undefined>;
  deleteSection(sectionId: number): Promise<boolean>;
  
  // Question operations
  getQuestionsBySectionId(sectionId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(questionId: number, questionData: Partial<Question>): Promise<Question | undefined>;
  deleteQuestion(questionId: number): Promise<boolean>;
  
  // Option operations
  getOptionsByQuestionId(questionId: number): Promise<Option[]>;
  createOption(option: InsertOption): Promise<Option>;
  updateOption(optionId: number, optionData: Partial<Option>): Promise<Option | undefined>;
  deleteOption(optionId: number): Promise<boolean>;
  
  // Attempt operations
  getUserExamAttempts(userId: number): Promise<UserExamAttempt[]>;
  getExamAttempts(examId: number): Promise<UserExamAttempt[]>;
  getAttempt(attemptId: number): Promise<UserExamAttempt | undefined>;
  createAttempt(attempt: InsertUserExamAttempt): Promise<UserExamAttempt>;
  updateAttempt(attemptId: number, attemptData: Partial<UserExamAttempt>): Promise<UserExamAttempt | undefined>;
  
  // Answer operations
  getUserAnswersByAttemptId(attemptId: number): Promise<UserAnswer[]>;
  createUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer>;
  
  // Notification operations
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: number): Promise<boolean>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private examsMap: Map<number, Exam>;
  private sectionsMap: Map<number, Section>;
  private questionsMap: Map<number, Question>;
  private optionsMap: Map<number, Option>;
  private attemptsMap: Map<number, UserExamAttempt>;
  private answersMap: Map<number, UserAnswer>;
  private notificationsMap: Map<number, Notification>;
  
  private userIdCounter: number;
  private examIdCounter: number;
  private sectionIdCounter: number;
  private questionIdCounter: number;
  private optionIdCounter: number;
  private attemptIdCounter: number;
  private answerIdCounter: number;
  private notificationIdCounter: number;
  
  sessionStore: session.SessionStore;
  
  constructor() {
    this.usersMap = new Map();
    this.examsMap = new Map();
    this.sectionsMap = new Map();
    this.questionsMap = new Map();
    this.optionsMap = new Map();
    this.attemptsMap = new Map();
    this.answersMap = new Map();
    this.notificationsMap = new Map();
    
    this.userIdCounter = 1;
    this.examIdCounter = 1;
    this.sectionIdCounter = 1;
    this.questionIdCounter = 1;
    this.optionIdCounter = 1;
    this.attemptIdCounter = 1;
    this.answerIdCounter = 1;
    this.notificationIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add sample users
    this.createUser({
      username: "Admin User",
      email: "admin@example.com",
      password: "your_hashed_password",
      dateOfBirth: new Date("1990-01-01"),
      role: "admin"
    });
    
    this.createUser({
      username: "Test User",
      email: "test@example.com",
      password: "your_hashed_password",
      dateOfBirth: new Date("1995-05-15"),
      role: "user"
    });
    
    this.createUser({
      username: "CSI User",
      email: "csi@it.com",
      password: "your_hashed_password",
      dateOfBirth: new Date("2000-12-25"),
      role: "teacher"
    });
  }
  
  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(user => user.email === email);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    this.usersMap.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.usersMap.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.usersMap.delete(id);
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }
  
  // Exam Operations
  async getExam(examId: number): Promise<Exam | undefined> {
    return this.examsMap.get(examId);
  }
  
  async getAllExams(): Promise<Exam[]> {
    return Array.from(this.examsMap.values());
  }
  
  async getExamsByUser(userId: number): Promise<Exam[]> {
    return Array.from(this.examsMap.values()).filter(exam => exam.createdBy === userId);
  }
  
  async createExam(exam: InsertExam): Promise<Exam> {
    const examId = this.examIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newExam: Exam = { ...exam, examId, createdAt, updatedAt };
    this.examsMap.set(examId, newExam);
    return newExam;
  }
  
  async updateExam(examId: number, examData: Partial<Exam>): Promise<Exam | undefined> {
    const exam = this.examsMap.get(examId);
    if (!exam) return undefined;
    
    const updatedExam: Exam = { 
      ...exam, 
      ...examData, 
      updatedAt: new Date() 
    };
    
    this.examsMap.set(examId, updatedExam);
    return updatedExam;
  }
  
  async deleteExam(examId: number): Promise<boolean> {
    return this.examsMap.delete(examId);
  }
  
  // Section Operations
  async getSectionsByExamId(examId: number): Promise<Section[]> {
    return Array.from(this.sectionsMap.values())
      .filter(section => section.examId === examId)
      .sort((a, b) => a.position - b.position);
  }
  
  async createSection(section: InsertSection): Promise<Section> {
    const sectionId = this.sectionIdCounter++;
    const createdAt = new Date();
    const newSection: Section = { ...section, sectionId, createdAt };
    this.sectionsMap.set(sectionId, newSection);
    return newSection;
  }
  
  async updateSection(sectionId: number, sectionData: Partial<Section>): Promise<Section | undefined> {
    const section = this.sectionsMap.get(sectionId);
    if (!section) return undefined;
    
    const updatedSection = { ...section, ...sectionData };
    this.sectionsMap.set(sectionId, updatedSection);
    return updatedSection;
  }
  
  async deleteSection(sectionId: number): Promise<boolean> {
    return this.sectionsMap.delete(sectionId);
  }
  
  // Question Operations
  async getQuestionsBySectionId(sectionId: number): Promise<Question[]> {
    return Array.from(this.questionsMap.values())
      .filter(question => question.sectionId === sectionId)
      .sort((a, b) => a.position - b.position);
  }
  
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const questionId = this.questionIdCounter++;
    const createdAt = new Date();
    const newQuestion: Question = { ...question, questionId, createdAt };
    this.questionsMap.set(questionId, newQuestion);
    return newQuestion;
  }
  
  async updateQuestion(questionId: number, questionData: Partial<Question>): Promise<Question | undefined> {
    const question = this.questionsMap.get(questionId);
    if (!question) return undefined;
    
    const updatedQuestion = { ...question, ...questionData };
    this.questionsMap.set(questionId, updatedQuestion);
    return updatedQuestion;
  }
  
  async deleteQuestion(questionId: number): Promise<boolean> {
    return this.questionsMap.delete(questionId);
  }
  
  // Option Operations
  async getOptionsByQuestionId(questionId: number): Promise<Option[]> {
    return Array.from(this.optionsMap.values())
      .filter(option => option.questionId === questionId)
      .sort((a, b) => a.position - b.position);
  }
  
  async createOption(option: InsertOption): Promise<Option> {
    const optionId = this.optionIdCounter++;
    const createdAt = new Date();
    const newOption: Option = { ...option, optionId, createdAt };
    this.optionsMap.set(optionId, newOption);
    return newOption;
  }
  
  async updateOption(optionId: number, optionData: Partial<Option>): Promise<Option | undefined> {
    const option = this.optionsMap.get(optionId);
    if (!option) return undefined;
    
    const updatedOption = { ...option, ...optionData };
    this.optionsMap.set(optionId, updatedOption);
    return updatedOption;
  }
  
  async deleteOption(optionId: number): Promise<boolean> {
    return this.optionsMap.delete(optionId);
  }
  
  // Attempt Operations
  async getUserExamAttempts(userId: number): Promise<UserExamAttempt[]> {
    return Array.from(this.attemptsMap.values())
      .filter(attempt => attempt.userId === userId);
  }
  
  async getExamAttempts(examId: number): Promise<UserExamAttempt[]> {
    return Array.from(this.attemptsMap.values())
      .filter(attempt => attempt.examId === examId);
  }
  
  async getAttempt(attemptId: number): Promise<UserExamAttempt | undefined> {
    return this.attemptsMap.get(attemptId);
  }
  
  async createAttempt(attempt: InsertUserExamAttempt): Promise<UserExamAttempt> {
    const attemptId = this.attemptIdCounter++;
    const createdAt = new Date();
    const newAttempt: UserExamAttempt = { 
      ...attempt, 
      attemptId, 
      createdAt,
      endTime: null,
      score: null
    };
    this.attemptsMap.set(attemptId, newAttempt);
    return newAttempt;
  }
  
  async updateAttempt(attemptId: number, attemptData: Partial<UserExamAttempt>): Promise<UserExamAttempt | undefined> {
    const attempt = this.attemptsMap.get(attemptId);
    if (!attempt) return undefined;
    
    const updatedAttempt = { ...attempt, ...attemptData };
    this.attemptsMap.set(attemptId, updatedAttempt);
    return updatedAttempt;
  }
  
  // Answer Operations
  async getUserAnswersByAttemptId(attemptId: number): Promise<UserAnswer[]> {
    return Array.from(this.answersMap.values())
      .filter(answer => answer.attemptId === attemptId);
  }
  
  async createUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer> {
    const answerId = this.answerIdCounter++;
    const createdAt = new Date();
    const newAnswer: UserAnswer = { 
      ...answer, 
      answerId, 
      createdAt,
      isCorrect: false,
      marksObtained: 0
    };
    this.answersMap.set(answerId, newAnswer);
    return newAnswer;
  }
  
  // Notification Operations
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationsMap.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const notificationId = this.notificationIdCounter++;
    const createdAt = new Date();
    const newNotification: Notification = { ...notification, notificationId, createdAt };
    this.notificationsMap.set(notificationId, newNotification);
    return newNotification;
  }
  
  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    const notification = this.notificationsMap.get(notificationId);
    if (!notification) return false;
    
    notification.isRead = true;
    this.notificationsMap.set(notificationId, notification);
    return true;
  }
}

export const storage = new MemStorage();
