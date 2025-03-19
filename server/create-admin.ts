import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByEmail("admin@meritorious.edu");
    
    if (existingAdmin) {
      console.log("Admin user already exists");
      console.log("Username: admin@meritorious.edu");
      console.log("Password: Admin123!");
      console.log("User role: admin");
      return;
    }
    
    // Create an admin user
    const hashedPassword = await hashPassword("Admin123!");
    
    const admin = await storage.createUser({
      username: "admin",
      email: "admin@meritorious.edu",
      password: hashedPassword,
      role: "admin",
      dateOfBirth: new Date("1990-01-01")
    });
    
    console.log("Admin user created successfully:");
    console.log("Username: admin@meritorious.edu");
    console.log("Password: Admin123!");
    console.log("User role: admin");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Create a regular user as well
async function createRegularUser() {
  try {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail("user@meritorious.edu");
    
    if (existingUser) {
      console.log("Regular user already exists");
      console.log("Username: user@meritorious.edu");
      console.log("Password: User123!");
      console.log("User role: user");
      return;
    }
    
    // Create a regular user
    const hashedPassword = await hashPassword("User123!");
    
    const user = await storage.createUser({
      username: "user",
      email: "user@meritorious.edu",
      password: hashedPassword,
      role: "user",
      dateOfBirth: new Date("1995-05-05")
    });
    
    console.log("Regular user created successfully:");
    console.log("Username: user@meritorious.edu");
    console.log("Password: User123!");
    console.log("User role: user");
  } catch (error) {
    console.error("Error creating regular user:", error);
  }
}

// Execute creation functions
async function createUsers() {
  await createAdminUser();
  await createRegularUser();
  process.exit(0);
}

createUsers();