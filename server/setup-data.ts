import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function setupData() {
  try {
    console.log("Starting data setup process...");
    
    // Create an admin user
    const adminPassword = await hashPassword("Admin123!");
    const admin = await storage.createUser({
      username: "admin",
      email: "admin@meritorious.edu",
      password: adminPassword,
      role: "admin",
      dateOfBirth: new Date("1990-01-01")
    });
    
    console.log("Admin user created successfully:");
    console.log("Email: admin@meritorious.edu");
    console.log("Password: Admin123!");
    
    // Create a regular user
    const userPassword = await hashPassword("User123!");
    const user = await storage.createUser({
      username: "user",
      email: "user@meritorious.edu",
      password: userPassword,
      role: "user",
      dateOfBirth: new Date("1995-05-05")
    });
    
    console.log("Regular user created successfully:");
    console.log("Email: user@meritorious.edu");
    console.log("Password: User123!");
    
    // Create a teacher user
    const teacherPassword = await hashPassword("Teacher123!");
    const teacher = await storage.createUser({
      username: "teacher",
      email: "teacher@meritorious.edu",
      password: teacherPassword,
      role: "teacher",
      dateOfBirth: new Date("1985-03-15")
    });
    
    console.log("Teacher user created successfully:");
    console.log("Email: teacher@meritorious.edu");
    console.log("Password: Teacher123!");
    
    // Create a math exam
    const mathExam = await storage.createExam({
      examName: "Mathematics Fundamentals",
      description: "Test your understanding of basic mathematical concepts",
      duration: 60,
      instructions: "Answer all questions. Each question carries equal marks.",
      publishDate: new Date(),
      isActive: true,
      createdBy: teacher.id
    });
    console.log(`Created exam: ${mathExam.examName}`);
    
    // Create an english exam
    const englishExam = await storage.createExam({
      examName: "English Literature",
      description: "Evaluate your knowledge of classic literature and comprehension",
      duration: 90,
      instructions: "Read passages carefully before answering questions.",
      publishDate: new Date(),
      isActive: true,
      createdBy: teacher.id
    });
    console.log(`Created exam: ${englishExam.examName}`);
    
    // Create a CS exam
    const csExam = await storage.createExam({
      examName: "Computer Science Basics",
      description: "Test your understanding of fundamental computing concepts",
      duration: 45,
      instructions: "Answer all questions. Focus on conceptual understanding.",
      publishDate: new Date(),
      isActive: true,
      createdBy: admin.id
    });
    console.log(`Created exam: ${csExam.examName}`);
    
    // Create sections for the math exam
    const algebraSection = await storage.createSection({
      examId: mathExam.examId,
      name: "Algebra",
      description: "Basic algebraic equations and expressions",
      position: 1
    });
    console.log(`Created section: ${algebraSection.name}`);
    
    const geometrySection = await storage.createSection({
      examId: mathExam.examId,
      name: "Geometry",
      description: "Properties of geometric shapes and spatial relationships",
      position: 2
    });
    console.log(`Created section: ${geometrySection.name}`);
    
    // Create sections for english exam
    const readingSection = await storage.createSection({
      examId: englishExam.examId,
      name: "Reading Comprehension",
      description: "Understand and analyze written passages",
      position: 1
    });
    console.log(`Created section: ${readingSection.name}`);
    
    const vocabSection = await storage.createSection({
      examId: englishExam.examId,
      name: "Vocabulary",
      description: "Test your knowledge of word meanings and usage",
      position: 2
    });
    console.log(`Created section: ${vocabSection.name}`);
    
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
    
    // Create options for the MCQ question
    await storage.createOption({
      questionId: question2.questionId,
      position: 1,
      optionText: "10",
      isCorrect: false
    });
    
    await storage.createOption({
      questionId: question2.questionId,
      position: 2,
      optionText: "12",
      isCorrect: true
    });
    
    await storage.createOption({
      questionId: question2.questionId,
      position: 3,
      optionText: "8",
      isCorrect: false
    });
    
    await storage.createOption({
      questionId: question2.questionId,
      position: 4,
      optionText: "14",
      isCorrect: false
    });
    console.log("Created options for algebra question 2");
    
    // Create an attempt for the regular user
    const attempt = await storage.createAttempt({
      examId: mathExam.examId,
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
      userAnswer: "2" // this should be the option ID, but for simplicity using a number
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
    
    console.log("\nData setup completed successfully!");
    
    console.log("\nTest Data Summary:");
    console.log(`- Users: Admin, Teacher, and Regular User`);
    console.log(`- Exams: 3 exams created`);
    console.log(`- Sections: 4 sections created`);
    console.log(`- Questions: 3 questions created`);
    console.log(`- User Attempts: 1 completed attempt created`);
    console.log(`- Notifications: 2 notifications created`);
    
  } catch (error) {
    console.error("Error in data setup process:", error);
    process.exit(1);
  }
}

// Execute the setup function
setupData();