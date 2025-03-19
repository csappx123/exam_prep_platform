import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertExamSchema, 
  insertSectionSchema, 
  insertQuestionSchema, 
  insertOptionSchema, 
  insertUserExamAttemptSchema, 
  insertUserAnswerSchema, 
  insertNotificationSchema 
} from "@shared/schema";
import { ZodError } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};

// Middleware to check if user is teacher or admin
const isTeacherOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user.role === "teacher" || req.user.role === "admin")) {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Error handler for Zod validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      });
    }
    return res.status(500).json({ message: "Server error" });
  };

  // User Routes
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Exam Routes
  app.get("/api/exams", isAuthenticated, async (req, res) => {
    try {
      const exams = await storage.getAllExams();
      // Filter by active status for non-admin/teacher users
      if (req.user && (req.user.role === "admin" || req.user.role === "teacher")) {
        return res.json(exams);
      }
      // Regular users only see active exams
      const activeExams = exams.filter(exam => exam.isActive);
      res.json(activeExams);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/exams/:id", isAuthenticated, async (req, res) => {
    try {
      const examId = parseInt(req.params.id);
      const exam = await storage.getExam(examId);
      
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      // Check if exam is active or user is admin/teacher
      if (!exam.isActive && req.user && req.user.role !== "admin" && req.user.role !== "teacher") {
        return res.status(403).json({ message: "Exam is not active" });
      }
      
      // Get sections
      const sections = await storage.getSectionsByExamId(examId);
      
      // Get questions and options for each section
      const sectionsWithQuestions = await Promise.all(sections.map(async (section) => {
        const questions = await storage.getQuestionsBySectionId(section.sectionId);
        
        const questionsWithOptions = await Promise.all(questions.map(async (question) => {
          const options = await storage.getOptionsByQuestionId(question.questionId);
          return { ...question, options };
        }));
        
        return { ...section, questions: questionsWithOptions };
      }));
      
      res.json({ ...exam, sections: sectionsWithQuestions });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/exams", isTeacherOrAdmin, async (req, res) => {
    try {
      const examData = insertExamSchema.parse({
        ...req.body,
        createdBy: req.user?.id
      });
      
      const exam = await storage.createExam(examData);
      res.status(201).json(exam);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.put("/api/exams/:id", isTeacherOrAdmin, async (req, res) => {
    try {
      const examId = parseInt(req.params.id);
      const exam = await storage.getExam(examId);
      
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      // Only allow update if user is admin or the creator
      if (req.user?.role !== "admin" && exam.createdBy !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedExam = await storage.updateExam(examId, req.body);
      res.json(updatedExam);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/exams/:id", isTeacherOrAdmin, async (req, res) => {
    try {
      const examId = parseInt(req.params.id);
      const exam = await storage.getExam(examId);
      
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      // Only allow delete if user is admin or the creator
      if (req.user?.role !== "admin" && exam.createdBy !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteExam(examId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Section Routes
  app.post("/api/sections", isTeacherOrAdmin, async (req, res) => {
    try {
      const sectionData = insertSectionSchema.parse(req.body);
      
      // Check if exam exists and user has permission
      const exam = await storage.getExam(sectionData.examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      if (req.user?.role !== "admin" && exam.createdBy !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const section = await storage.createSection(sectionData);
      res.status(201).json(section);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  // Question Routes
  app.post("/api/questions", isTeacherOrAdmin, async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      
      // Check if section exists and user has permission
      const sections = await storage.getSectionsByExamId(questionData.sectionId);
      const section = sections.find(s => s.sectionId === questionData.sectionId);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      const exam = await storage.getExam(section.examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      if (req.user?.role !== "admin" && exam.createdBy !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  // Option Routes
  app.post("/api/options", isTeacherOrAdmin, async (req, res) => {
    try {
      const optionData = insertOptionSchema.parse(req.body);
      
      // Check if question exists - get from a section that contains this question
      const sections = await storage.getAllSectionIds();
      let questionFound = false;
      
      for (const sectionId of sections) {
        const questions = await storage.getQuestionsBySectionId(sectionId);
        const question = questions.find(q => q.questionId === optionData.questionId);
        if (question) {
          questionFound = true;
          break;
        }
      }
      
      if (!questionFound) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const option = await storage.createOption(optionData);
      res.status(201).json(option);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  // Test Taking Routes
  app.post("/api/attempts", isAuthenticated, async (req, res) => {
    try {
      const attemptData = insertUserExamAttemptSchema.parse({
        ...req.body,
        userId: req.user?.id,
        startTime: new Date()
      });
      
      // Check if exam exists and is active
      const exam = await storage.getExam(attemptData.examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      if (!exam.isActive) {
        return res.status(403).json({ message: "Exam is not active" });
      }
      
      // Create attempt
      const attempt = await storage.createAttempt(attemptData);
      res.status(201).json(attempt);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.post("/api/attempts/:id/submit", isAuthenticated, async (req, res) => {
    try {
      const attemptId = parseInt(req.params.id);
      const attempt = await storage.getAttempt(attemptId);
      
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }
      
      // Ensure user owns this attempt
      if (attempt.userId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Update attempt as completed
      const endTime = new Date();
      const updatedAttempt = await storage.updateAttempt(attemptId, {
        endTime,
        status: "completed"
      });
      
      // Calculate score based on answers
      const answers = await storage.getUserAnswersByAttemptId(attemptId);
      let totalMarks = 0;
      let obtainedMarks = 0;
      
      for (const answer of answers) {
        const question = await storage.questionsMap.get(answer.questionId);
        if (!question) continue;
        
        totalMarks += Number(question.marks) || 0;
        
        // Check if answer is correct based on question type
        let isCorrect = false;
        
        if (question.questionType === "mcq") {
          const options = await storage.getOptionsByQuestionId(question.questionId);
          const correctOption = options.find(opt => opt.isCorrect);
          isCorrect = answer.userAnswer === correctOption?.optionId.toString();
        } else if (question.questionType === "true_false") {
          isCorrect = answer.userAnswer === question.correctAnswer;
        } else if (question.questionType === "fill_in") {
          // Case insensitive comparison for fill-in answers
          isCorrect = (answer.userAnswer || "").toLowerCase() === (question.correctAnswer || "").toLowerCase();
        }
        
        // Update answer with correctness and marks
        const marksObtained = isCorrect ? Number(question.marks) : 0;
        obtainedMarks += marksObtained;
        
        // Update answer in storage
        await storage.answersMap.set(answer.answerId, {
          ...answer,
          isCorrect,
          marksObtained
        });
      }
      
      // Calculate score percentage
      const scorePercentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
      
      // Update attempt with score
      const scoredAttempt = await storage.updateAttempt(attemptId, {
        score: scorePercentage
      });
      
      // Create a notification
      await storage.createNotification({
        userId: req.user!.id,
        title: "Test Completed",
        message: `You have completed "${(await storage.getExam(attempt.examId))?.examName}" with a score of ${scorePercentage.toFixed(2)}%`,
        type: "info",
        isRead: false
      });
      
      res.json(scoredAttempt);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/answers", isAuthenticated, async (req, res) => {
    try {
      const answerData = insertUserAnswerSchema.parse(req.body);
      
      // Check if attempt exists and belongs to user
      const attempt = await storage.getAttempt(answerData.attemptId);
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }
      
      if (attempt.userId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if test is still in progress
      if (attempt.status !== "in_progress") {
        return res.status(400).json({ message: "Test is no longer in progress" });
      }
      
      // Save the answer
      const answer = await storage.createUserAnswer(answerData);
      res.status(201).json(answer);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  // Results Routes
  app.get("/api/attempts/:id/results", isAuthenticated, async (req, res) => {
    try {
      const attemptId = parseInt(req.params.id);
      const attempt = await storage.getAttempt(attemptId);
      
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }
      
      // Users can only see their own results, or teachers/admins can see any results
      if (attempt.userId !== req.user?.id && req.user?.role !== "admin" && req.user?.role !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Get exam details
      const exam = await storage.getExam(attempt.examId);
      
      // Get all answers for this attempt
      const answers = await storage.getUserAnswersByAttemptId(attemptId);
      
      // Get questions and options for each answer
      const answersWithDetails = await Promise.all(answers.map(async (answer) => {
        const question = await storage.questionsMap.get(answer.questionId);
        if (!question) return null;
        
        const options = await storage.getOptionsByQuestionId(question.questionId);
        
        return {
          ...answer,
          question: { ...question, options }
        };
      }));
      
      // Filter out any null answers
      const validAnswers = answersWithDetails.filter(Boolean);
      
      res.json({
        attempt,
        exam,
        answers: validAnswers
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // User Results
  app.get("/api/user/attempts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const attempts = await storage.getUserExamAttempts(userId!);
      
      // Get exam details for each attempt
      const attemptsWithExams = await Promise.all(attempts.map(async (attempt) => {
        const exam = await storage.getExam(attempt.examId);
        return { ...attempt, exam };
      }));
      
      res.json(attemptsWithExams);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Notification Routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const success = await storage.markNotificationAsRead(notificationId);
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
