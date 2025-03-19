import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedData() {
  try {
    console.log("Starting data seeding process...");
    
    // Get admin and user accounts
    const admin = await storage.getUserByEmail("admin@meritorious.edu");
    const user = await storage.getUserByEmail("user@meritorious.edu");
    
    if (!admin || !user) {
      throw new Error("Admin or regular user accounts not found. Please create them first.");
    }
    
    // Create a teacher user if it doesn't exist
    let teacher;
    try {
      teacher = await storage.getUserByEmail("teacher@meritorious.edu");
      
      if (!teacher) {
        const hashedPassword = await hashPassword("Teacher123!");
        teacher = await storage.createUser({
          username: "teacher",
          email: "teacher@meritorious.edu",
          password: hashedPassword,
          role: "teacher",
          dateOfBirth: new Date("1985-03-15")
        });
        console.log("Created teacher user: teacher@meritorious.edu / Teacher123!");
      } else {
        console.log("Teacher user already exists.");
      }
    } catch (error) {
      console.error("Error creating teacher:", error);
    }
    
    // Create a simple math exam
    try {
      const exam = await storage.createExam({
        examName: "Mathematics Fundamentals",
        description: "Test your understanding of basic mathematical concepts",
        duration: 60,
        instructions: "Answer all questions. Each question carries equal marks.",
        publishDate: new Date(),
        isActive: true,
        createdBy: teacher?.id || admin.id
      });
      console.log(`Created exam: ${exam.examName}`);
      
      // Create sections for the math exam
      const algebraSection = await storage.createSection({
        examId: exam.examId,
        name: "Algebra",
        description: "Basic algebraic equations and expressions",
        position: 1
      });
      console.log(`Created section: ${algebraSection.name}`);
      
      const geometrySection = await storage.createSection({
        examId: exam.examId,
        name: "Geometry",
        description: "Properties of geometric shapes and spatial relationships",
        position: 2
      });
      console.log(`Created section: ${geometrySection.name}`);
      
      // Create some questions for the algebra section
      const question1 = await storage.createQuestion({
        sectionId: algebraSection.sectionId,
        position: 1,
        questionText: "Solve for x: 2x + 5 = 15",
        questionType: "fill_in",
        correctAnswer: "5",
        marks: "5",
        solutionText: null
      });
      console.log("Created algebra question 1");
      
      const question2 = await storage.createQuestion({
        sectionId: algebraSection.sectionId,
        position: 2,
        questionText: "If f(x) = x² + 3x + 2, what is f(2)?",
        questionType: "mcq",
        correctAnswer: null,
        marks: "5",
        solutionText: null
      });
      console.log("Created algebra question 2");
      
      // Create options for the MCQ question
      const option1 = await storage.createOption({
        questionId: question2.questionId,
        position: 1,
        optionText: "10",
        isCorrect: false
      });
      
      const option2 = await storage.createOption({
        questionId: question2.questionId,
        position: 2,
        optionText: "12",
        isCorrect: true
      });
      
      const option3 = await storage.createOption({
        questionId: question2.questionId,
        position: 3,
        optionText: "8",
        isCorrect: false
      });
      
      const option4 = await storage.createOption({
        questionId: question2.questionId,
        position: 4,
        optionText: "14",
        isCorrect: false
      });
      console.log("Created options for algebra question 2");
      
      // Create a question for the geometry section
      const question3 = await storage.createQuestion({
        sectionId: geometrySection.sectionId,
        position: 1,
        questionText: "Is a square a rectangle?",
        questionType: "true_false",
        correctAnswer: "true",
        marks: "5",
        solutionText: null
      });
      console.log("Created geometry question");
      
      // Create an attempt for the regular user
      const attempt = await storage.createAttempt({
        examId: exam.examId,
        userId: user.id,
        startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        status: "completed"
      });
      
      // Update the attempt with a score and end time
      await storage.updateAttempt(attempt.attemptId, {
        endTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        score: "85.5"
      });
      console.log("Created attempt for user");
      
      // Create some answers for the user
      await storage.createUserAnswer({
        attemptId: attempt.attemptId,
        questionId: question1.questionId,
        userAnswer: "5"
      });
      
      await storage.createUserAnswer({
        attemptId: attempt.attemptId,
        questionId: question2.questionId,
        userAnswer: option2.optionId.toString()
      });
      
      await storage.createUserAnswer({
        attemptId: attempt.attemptId,
        questionId: question3.questionId,
        userAnswer: "true"
      });
      console.log("Created answers for the attempt");
      
      // Create some notifications for the user
      await storage.createNotification({
        userId: user.id,
        title: "Welcome to Meritorious!",
        message: "Welcome to the Meritorious Exam Preparation Platform. Start exploring tests and track your progress.",
        type: "info",
        isRead: true
      });
      
      await storage.createNotification({
        userId: user.id,
        title: "Test Completed",
        message: "You have completed the Mathematics Fundamentals exam with a score of 85.5%. Well done!",
        type: "success",
        isRead: false
      });
      console.log("Created notifications for user");
    } catch (error) {
      console.error("Error creating exam data:", error);
    }
    
    console.log("\nData seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error in seed data process:", error);
    process.exit(1);
  }
}

// Execute the seeding function
seedData();