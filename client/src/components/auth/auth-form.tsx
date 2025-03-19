import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional()
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  dateOfBirth: z.string().refine(date => {
    const parsedDate = new Date(date);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 100); // Maximum age 100 years
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() - 13); // Minimum age 13 years
    
    return parsedDate >= minDate && parsedDate <= maxDate;
  }, "You must be between 13 and 100 years old"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms and conditions")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Password reset schema
const passwordResetSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  dateOfBirth: z.string().nonempty("Date of birth is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "reset">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      dateOfBirth: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false
    }
  });

  // Password reset form
  const resetForm = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      username: "",
      dateOfBirth: ""
    }
  });

  // Handle login submission
  const handleLogin = (data: LoginFormValues) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password
    });
  };

  // Handle registration submission
  const handleRegister = (data: RegisterFormValues) => {
    registerMutation.mutate({
      username: data.username,
      email: data.email,
      password: data.password,
      dateOfBirth: new Date(data.dateOfBirth),
      role: "user" // Default role for new users
    });
  };

  // Handle password reset
  const handlePasswordReset = (data: PasswordResetFormValues) => {
    // In a real app, this would call an API endpoint
    toast({
      title: "Password reset requested",
      description: "If an account matching these details exists, you will receive reset instructions via email.",
    });
    resetForm.reset();
    setActiveTab("login");
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {activeTab === "login" ? "Welcome Back" : 
          activeTab === "register" ? "Create Account" : "Reset Password"}
        </h1>
        <p className="text-gray-600">
          {activeTab === "login" ? "Sign in to your account" : 
          activeTab === "register" ? "Join our exam preparation platform" : "Recover your account access"}
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "login" | "register" | "reset")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        {/* Login Form */}
        <TabsContent value="login">
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...loginForm.register("email")}
                className="mt-1"
              />
              {loginForm.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...loginForm.register("password")}
                  className="mt-1 pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox 
                  id="rememberMe" 
                  {...loginForm.register("rememberMe")} 
                  className="h-4 w-4"
                />
                <Label htmlFor="rememberMe" className="ml-2 text-sm">Remember me</Label>
              </div>
              <Button 
                type="button" 
                variant="link" 
                className="text-sm text-primary p-0"
                onClick={() => setActiveTab("reset")}
              >
                Forgot password?
              </Button>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-primary p-0"
                  onClick={() => setActiveTab("register")}
                >
                  Register now
                </Button>
              </p>
            </div>
          </form>
        </TabsContent>

        {/* Register Form */}
        <TabsContent value="register">
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                {...registerForm.register("username")}
                className="mt-1"
              />
              {registerForm.formState.errors.username && (
                <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.username.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...registerForm.register("email")}
                className="mt-1"
              />
              {registerForm.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...registerForm.register("dateOfBirth")}
                className="mt-1"
              />
              {registerForm.formState.errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...registerForm.register("password")}
                  className="mt-1 pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {registerForm.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...registerForm.register("confirmPassword")}
                  className="mt-1 pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {registerForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start">
              <Checkbox 
                id="acceptTerms" 
                {...registerForm.register("acceptTerms")} 
                className="h-4 w-4 mt-1"
              />
              <Label htmlFor="acceptTerms" className="ml-2 text-sm">
                I accept the <a href="#" className="text-primary">Terms and Conditions</a> and <a href="#" className="text-primary">Privacy Policy</a>
              </Label>
            </div>
            {registerForm.formState.errors.acceptTerms && (
              <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.acceptTerms.message}</p>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating account..." : "Register"}
            </Button>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-primary p-0"
                  onClick={() => setActiveTab("login")}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </form>
        </TabsContent>

        {/* Password Reset Form */}
        <TabsContent value="reset">
          <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
            <div>
              <Label htmlFor="resetUsername">Username</Label>
              <Input
                id="resetUsername"
                type="text"
                placeholder="Enter your username"
                {...resetForm.register("username")}
                className="mt-1"
              />
              {resetForm.formState.errors.username && (
                <p className="text-red-500 text-sm mt-1">{resetForm.formState.errors.username.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="resetDateOfBirth">Date of Birth</Label>
              <Input
                id="resetDateOfBirth"
                type="date"
                {...resetForm.register("dateOfBirth")}
                className="mt-1"
              />
              {resetForm.formState.errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">{resetForm.formState.errors.dateOfBirth.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Submit
            </Button>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-primary p-0"
                  onClick={() => setActiveTab("login")}
                >
                  Back to login
                </Button>
              </p>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
