import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Create initial test data if not exists
async function setupInitialData() {
  log("Setting up initial test data...");
  
  // Check if admin user exists
  const existingAdmin = await storage.getUserByEmail("admin@meritorious.edu");
  if (existingAdmin) {
    log("Initial data already exists. Skipping setup.");
    return;
  }
  
  // Create admin user
  const adminPassword = await hashPassword("Admin123!");
  const admin = await storage.createUser({
    username: "admin",
    email: "admin@meritorious.edu",
    password: adminPassword,
    role: "admin",
    dateOfBirth: new Date("1990-01-01")
  });
  log("Created admin user: admin@meritorious.edu");
  
  // Create regular user
  const userPassword = await hashPassword("User123!");
  const user = await storage.createUser({
    username: "user",
    email: "user@meritorious.edu",
    password: userPassword,
    role: "user",
    dateOfBirth: new Date("1995-05-05")
  });
  log("Created regular user: user@meritorious.edu");
  
  // Create teacher user
  const teacherPassword = await hashPassword("Teacher123!");
  const teacher = await storage.createUser({
    username: "teacher",
    email: "teacher@meritorious.edu",
    password: teacherPassword,
    role: "teacher",
    dateOfBirth: new Date("1985-03-15")
  });
  log("Created teacher user: teacher@meritorious.edu");
  
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
  
  // Create a section for the math exam
  const algebraSection = await storage.createSection({
    examId: mathExam.examId,
    name: "Algebra",
    description: "Basic algebraic equations and expressions",
    position: 1
  });
  
  // Create a question for the section
  const algebraQuestion = await storage.createQuestion({
    sectionId: algebraSection.sectionId,
    position: 1,
    questionText: "Solve for x: 2x + 5 = 15",
    questionType: "fill_in",
    correctAnswer: "5",
    marks: "5",
    solutionText: null
  });
  
  log("Basic test data created successfully");
}

(async () => {
  // Setup initial test data
  await setupInitialData();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
