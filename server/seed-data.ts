import { storage } from "./storage";
import { 
  questionTypeEnum, 
  attemptStatusEnum,
  userRoleEnum
} from "@shared/schema";

// Function to create a teacher user
async function createTeacherUser() {
  try {
    // Check if teacher already exists
    const existingTeacher = await storage.getUserByEmail("teacher@meritorious.edu");
    
    if (existingTeacher) {
      console.log("Teacher user already exists");
      return existingTeacher;
    }
    
    // Create a teacher user
    const teacher = await storage.createUser({
      username: "teacher",
      email: "teacher@meritorious.edu",
      password: "Teacher123!",
      role: "teacher",
      dateOfBirth: new Date("1985-03-15")
    });
    
    console.log("Teacher user created successfully:");
    console.log("Email: teacher@meritorious.edu");
    console.log("Password: Teacher123!");
    
    return teacher;
  } catch (error) {
    console.error("Error creating teacher user:", error);
    throw error;
  }
}

// Function to create exams
async function createExams(teacherId: number, adminId: number) {
  try {
    const exams = [
      {
        examName: "Mathematics Fundamentals",
        description: "Test your understanding of basic mathematical concepts",
        duration: 60, // 60 minutes
        instructions: "Answer all questions. Each question carries equal marks.",
        publishDate: new Date(),
        isActive: true,
        createdBy: teacherId
      },
      {
        examName: "English Literature",
        description: "Evaluate your knowledge of classic literature and comprehension",
        duration: 90, // 90 minutes
        instructions: "Read passages carefully before answering questions.",
        publishDate: new Date(),
        isActive: true,
        createdBy: teacherId
      },
      {
        examName: "Computer Science Basics",
        description: "Test your understanding of fundamental computing concepts",
        duration: 45, // 45 minutes
        instructions: "Answer all questions. Focus on conceptual understanding.",
        publishDate: new Date(),
        isActive: true,
        createdBy: adminId
      },
      {
        examName: "General Knowledge",
        description: "Test your awareness of current affairs and general knowledge",
        duration: 30, // 30 minutes
        instructions: "Choose the best answer for each question.",
        publishDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
        isActive: false,
        createdBy: adminId
      }
    ];
    
    const createdExams = [];
    
    for (const examData of exams) {
      const exam = await storage.createExam(examData);
      createdExams.push(exam);
      console.log(`Created exam: ${exam.examName}`);
    }
    
    return createdExams;
  } catch (error) {
    console.error("Error creating exams:", error);
    throw error;
  }
}

// Function to create sections for exams
async function createSections(exams: any[]) {
  try {
    const sectionsByExam = [
      // Math exam sections
      [
        {
          examId: exams[0].examId,
          sectionName: "Algebra",
          description: "Basic algebraic equations and expressions",
          position: 1
        },
        {
          examId: exams[0].examId,
          sectionName: "Geometry",
          description: "Properties of geometric shapes and spatial relationships",
          position: 2
        }
      ],
      // English exam sections
      [
        {
          examId: exams[1].examId,
          sectionName: "Reading Comprehension",
          description: "Understand and analyze written passages",
          position: 1
        },
        {
          examId: exams[1].examId,
          sectionName: "Vocabulary",
          description: "Test your knowledge of word meanings and usage",
          position: 2
        }
      ],
      // Computer Science exam sections
      [
        {
          examId: exams[2].examId,
          sectionName: "Programming Basics",
          description: "Fundamentals of programming concepts",
          position: 1
        },
        {
          examId: exams[2].examId,
          sectionName: "Computer Architecture",
          description: "Basic components and organization of computer systems",
          position: 2
        }
      ],
      // General Knowledge exam sections
      [
        {
          examId: exams[3].examId,
          sectionName: "Current Affairs",
          description: "Recent happenings around the world",
          position: 1
        },
        {
          examId: exams[3].examId,
          sectionName: "History & Geography",
          description: "Important historical events and geographical knowledge",
          position: 2
        }
      ]
    ];
    
    const allSections = [];
    
    for (const examSections of sectionsByExam) {
      for (const sectionData of examSections) {
        const section = await storage.createSection(sectionData);
        allSections.push(section);
        console.log(`Created section: ${section.sectionName} for exam ID: ${section.examId}`);
      }
    }
    
    return allSections;
  } catch (error) {
    console.error("Error creating sections:", error);
    throw error;
  }
}

// Function to create questions for sections
async function createQuestions(sections: any[]) {
  try {
    // Math exam - Algebra section questions
    const algebraQuestions = [
      {
        sectionId: sections[0].sectionId,
        questionText: "Solve for x: 2x + 5 = 15",
        questionType: "fill_in",
        correctAnswer: "5",
        marks: 5
      },
      {
        sectionId: sections[0].sectionId,
        questionText: "What is the quadratic formula?",
        questionType: "fill_in",
        correctAnswer: "x = (-b ± √(b² - 4ac)) / 2a",
        marks: 5
      },
      {
        sectionId: sections[0].sectionId,
        questionText: "If f(x) = x² + 3x + 2, what is f(2)?",
        questionType: "mcq",
        marks: 5
      }
    ];
    
    // Math exam - Geometry section questions
    const geometryQuestions = [
      {
        sectionId: sections[1].sectionId,
        questionText: "What is the formula for the area of a circle?",
        questionType: "mcq",
        marks: 5
      },
      {
        sectionId: sections[1].sectionId,
        questionText: "The sum of angles in a triangle is:",
        questionType: "mcq",
        marks: 5
      },
      {
        sectionId: sections[1].sectionId,
        questionText: "Is a square a rectangle?",
        questionType: "true_false",
        correctAnswer: "true",
        marks: 5
      }
    ];
    
    // English exam - Reading Comprehension section questions
    const readingQuestions = [
      {
        sectionId: sections[2].sectionId,
        questionText: `Read the following passage: "The sun was setting over the horizon, casting long shadows across the field. John knew he had to hurry if he wanted to make it home before dark." What time of day is described in the passage?`,
        questionType: "mcq",
        marks: 5
      },
      {
        sectionId: sections[2].sectionId,
        questionText: "What is the main purpose of a thesis statement in an essay?",
        questionType: "mcq",
        marks: 5
      }
    ];
    
    // English exam - Vocabulary section questions
    const vocabQuestions = [
      {
        sectionId: sections[3].sectionId,
        questionText: "What is the meaning of 'ubiquitous'?",
        questionType: "mcq",
        marks: 5
      },
      {
        sectionId: sections[3].sectionId,
        questionText: "Choose the word that is closest in meaning to 'benevolent':",
        questionType: "mcq",
        marks: 5
      }
    ];
    
    // Computer Science - Programming Basics section questions
    const programmingQuestions = [
      {
        sectionId: sections[4].sectionId,
        questionText: "What does HTML stand for?",
        questionType: "fill_in",
        correctAnswer: "Hypertext Markup Language",
        marks: 5
      },
      {
        sectionId: sections[4].sectionId,
        questionText: "In programming, what is a variable?",
        questionType: "mcq",
        marks: 5
      }
    ];
    
    // Computer Science - Computer Architecture section questions
    const architectureQuestions = [
      {
        sectionId: sections[5].sectionId,
        questionText: "What is the main function of a CPU?",
        questionType: "mcq",
        marks: 5
      },
      {
        sectionId: sections[5].sectionId,
        questionText: "RAM stands for:",
        questionType: "mcq",
        marks: 5
      }
    ];
    
    // General Knowledge - Current Affairs section questions
    const currentAffairsQuestions = [
      {
        sectionId: sections[6].sectionId,
        questionText: "Who is the current Secretary-General of the United Nations?",
        questionType: "mcq",
        marks: 5
      },
      {
        sectionId: sections[6].sectionId,
        questionText: "Which country hosted the most recent Summer Olympics?",
        questionType: "mcq",
        marks: 5
      }
    ];
    
    // General Knowledge - History & Geography section questions
    const histGeoQuestions = [
      {
        sectionId: sections[7].sectionId,
        questionText: "Which river is the longest in the world?",
        questionType: "mcq",
        marks: 5
      },
      {
        sectionId: sections[7].sectionId,
        questionText: "In which year did World War II end?",
        questionType: "fill_in",
        correctAnswer: "1945",
        marks: 5
      }
    ];
    
    const allQuestions = [
      ...algebraQuestions,
      ...geometryQuestions,
      ...readingQuestions,
      ...vocabQuestions,
      ...programmingQuestions,
      ...architectureQuestions,
      ...currentAffairsQuestions,
      ...histGeoQuestions
    ];
    
    const createdQuestions = [];
    
    for (const questionData of allQuestions) {
      const question = await storage.createQuestion(questionData);
      createdQuestions.push(question);
      console.log(`Created question for section ID: ${question.sectionId}`);
    }
    
    return createdQuestions;
  } catch (error) {
    console.error("Error creating questions:", error);
    throw error;
  }
}

// Function to create options for MCQ questions
async function createOptions(questions: any[]) {
  try {
    const optionsMap = {
      // Math Algebra - f(2) question
      2: [
        { optionText: "10", isCorrect: false },
        { optionText: "12", isCorrect: true },
        { optionText: "8", isCorrect: false },
        { optionText: "14", isCorrect: false }
      ],
      // Math Geometry - circle area formula
      3: [
        { optionText: "πr²", isCorrect: true },
        { optionText: "2πr", isCorrect: false },
        { optionText: "πr", isCorrect: false },
        { optionText: "2πr²", isCorrect: false }
      ],
      // Math Geometry - triangle angles
      4: [
        { optionText: "180 degrees", isCorrect: true },
        { optionText: "90 degrees", isCorrect: false },
        { optionText: "360 degrees", isCorrect: false },
        { optionText: "270 degrees", isCorrect: false }
      ],
      // English Reading - time of day
      6: [
        { optionText: "Morning", isCorrect: false },
        { optionText: "Noon", isCorrect: false },
        { optionText: "Evening", isCorrect: true },
        { optionText: "Midnight", isCorrect: false }
      ],
      // English Reading - thesis statement
      7: [
        { optionText: "To introduce the topic", isCorrect: false },
        { optionText: "To state the main argument", isCorrect: true },
        { optionText: "To summarize the essay", isCorrect: false },
        { optionText: "To list all points", isCorrect: false }
      ],
      // English Vocabulary - ubiquitous
      8: [
        { optionText: "Rare", isCorrect: false },
        { optionText: "Found everywhere", isCorrect: true },
        { optionText: "Transparent", isCorrect: false },
        { optionText: "Unreliable", isCorrect: false }
      ],
      // English Vocabulary - benevolent
      9: [
        { optionText: "Strict", isCorrect: false },
        { optionText: "Kind", isCorrect: true },
        { optionText: "Powerful", isCorrect: false },
        { optionText: "Curious", isCorrect: false }
      ],
      // Programming - variable
      11: [
        { optionText: "A fixed value that never changes", isCorrect: false },
        { optionText: "A container for storing data values", isCorrect: true },
        { optionText: "A type of function", isCorrect: false },
        { optionText: "A programming language", isCorrect: false }
      ],
      // Computer Architecture - CPU function
      12: [
        { optionText: "Store permanent data", isCorrect: false },
        { optionText: "Display images on screen", isCorrect: false },
        { optionText: "Process data and execute instructions", isCorrect: true },
        { optionText: "Connect to the internet", isCorrect: false }
      ],
      // Computer Architecture - RAM
      13: [
        { optionText: "Random Access Memory", isCorrect: true },
        { optionText: "Read Always Memory", isCorrect: false },
        { optionText: "Readily Available Memory", isCorrect: false },
        { optionText: "Rapid Allocation Memory", isCorrect: false }
      ],
      // Current Affairs - UN Secretary-General
      14: [
        { optionText: "António Guterres", isCorrect: true },
        { optionText: "Ban Ki-moon", isCorrect: false },
        { optionText: "Kofi Annan", isCorrect: false },
        { optionText: "Boutros Boutros-Ghali", isCorrect: false }
      ],
      // Current Affairs - Olympics
      15: [
        { optionText: "Japan", isCorrect: true },
        { optionText: "Brazil", isCorrect: false },
        { optionText: "France", isCorrect: false },
        { optionText: "United States", isCorrect: false }
      ],
      // History & Geography - longest river
      16: [
        { optionText: "Amazon", isCorrect: false },
        { optionText: "Nile", isCorrect: true },
        { optionText: "Mississippi", isCorrect: false },
        { optionText: "Yangtze", isCorrect: false }
      ]
    };
    
    const createdOptions = [];
    
    for (const question of questions) {
      if (question.questionType === "mcq") {
        const options = optionsMap[question.questionId as keyof typeof optionsMap];
        
        if (options) {
          for (const optionData of options) {
            const option = await storage.createOption({
              questionId: question.questionId,
              ...optionData
            });
            
            createdOptions.push(option);
            console.log(`Created option for question ID: ${option.questionId}`);
          }
        }
      }
    }
    
    return createdOptions;
  } catch (error) {
    console.error("Error creating options:", error);
    throw error;
  }
}

// Function to create a test attempt for a user
async function createAttempts(userId: number, exams: any[]) {
  try {
    // Create a completed attempt for the first exam
    const completedAttempt = await storage.createAttempt({
      userId,
      examId: exams[0].examId,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      score: 85.5,
      status: "completed"
    });
    
    console.log(`Created completed attempt for user ID: ${userId}, exam: ${exams[0].examName}`);
    
    // Create an in-progress attempt for the second exam
    const inProgressAttempt = await storage.createAttempt({
      userId,
      examId: exams[1].examId,
      startTime: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
      status: "in_progress"
    });
    
    console.log(`Created in-progress attempt for user ID: ${userId}, exam: ${exams[1].examName}`);
    
    return [completedAttempt, inProgressAttempt];
  } catch (error) {
    console.error("Error creating attempts:", error);
    throw error;
  }
}

// Function to create answers for the completed attempt
async function createAnswers(userId: number, attemptId: number, questions: any[]) {
  try {
    // Only create answers for the first 6 questions (algebra and geometry sections)
    const relevantQuestions = questions.slice(0, 6);
    
    const answers = [];
    
    for (const question of relevantQuestions) {
      let userAnswer: string;
      let isCorrect: boolean;
      let marksObtained: number;
      
      // Determine answer based on question type
      if (question.questionType === "mcq") {
        // For MCQ, get the correct option ID
        const options = await storage.getOptionsByQuestionId(question.questionId);
        const correctOption = options.find(opt => opt.isCorrect);
        
        // Randomly decide if user got it right (75% chance for correct)
        isCorrect = Math.random() < 0.75;
        userAnswer = isCorrect ? correctOption?.optionId.toString() : options.find(opt => !opt.isCorrect)?.optionId.toString();
      } else if (question.questionType === "true_false") {
        isCorrect = Math.random() < 0.75;
        userAnswer = isCorrect ? question.correctAnswer : (question.correctAnswer === "true" ? "false" : "true");
      } else { // fill_in
        isCorrect = Math.random() < 0.75;
        userAnswer = isCorrect ? question.correctAnswer : "wrong answer";
      }
      
      marksObtained = isCorrect ? question.marks : 0;
      
      const answer = await storage.createUserAnswer({
        attemptId,
        questionId: question.questionId,
        userAnswer,
        isCorrect,
        marksObtained
      });
      
      answers.push(answer);
      console.log(`Created answer for question ID: ${question.questionId}, attempt ID: ${attemptId}`);
    }
    
    return answers;
  } catch (error) {
    console.error("Error creating answers:", error);
    throw error;
  }
}

// Function to create notifications
async function createNotifications(userId: number) {
  try {
    const notifications = [
      {
        userId,
        title: "Welcome to Meritorious!",
        message: "Welcome to the Meritorious Exam Preparation Platform. Start exploring tests and track your progress.",
        type: "info",
        isRead: true
      },
      {
        userId,
        title: "Test Completed",
        message: "You have completed the Mathematics Fundamentals exam with a score of 85.5%. Well done!",
        type: "success",
        isRead: false
      },
      {
        userId,
        title: "New Exam Available",
        message: "A new Computer Science Basics exam is now available. Take it to test your knowledge!",
        type: "info",
        isRead: false
      }
    ];
    
    const createdNotifications = [];
    
    for (const notifData of notifications) {
      const notification = await storage.createNotification(notifData);
      createdNotifications.push(notification);
      console.log(`Created notification for user ID: ${userId}: ${notification.title}`);
    }
    
    return createdNotifications;
  } catch (error) {
    console.error("Error creating notifications:", error);
    throw error;
  }
}

// Main function to seed all data
async function seedData() {
  try {
    console.log("Starting data seeding process...");
    
    // Get admin and user accounts that were already created
    const admin = await storage.getUserByEmail("admin@meritorious.edu");
    const user = await storage.getUserByEmail("user@meritorious.edu");
    const teacher = await createTeacherUser();
    
    if (!admin || !user) {
      throw new Error("Admin or regular user accounts not found. Please create them first.");
    }
    
    // Create exams
    const exams = await createExams(teacher.id, admin.id);
    
    // Create sections
    const sections = await createSections(exams);
    
    // Create questions
    const questions = await createQuestions(sections);
    
    // Create options for MCQ questions
    await createOptions(questions);
    
    // Create attempts for the regular user
    const attempts = await createAttempts(user.id, exams);
    
    // Create answers for the completed attempt
    await createAnswers(user.id, attempts[0].attemptId, questions);
    
    // Create notifications for the regular user
    await createNotifications(user.id);
    
    console.log("Data seeding completed successfully!");
    
    console.log("\nTest Data Summary:");
    console.log(`- Users: Admin, Teacher, and Regular User`);
    console.log(`- Exams: ${exams.length} exams created`);
    console.log(`- Sections: ${sections.length} sections created`);
    console.log(`- Questions: ${questions.length} questions created`);
    console.log(`- User Attempts: 2 attempts created (1 completed, 1 in-progress)`);
    console.log(`- Notifications: 3 notifications created`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error in seed data process:", error);
    process.exit(1);
  }
}

// Execute the seeding function
seedData();