import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import AuthForm from "@/components/auth/auth-form";
import { GraduationCap } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();

  // Redirect to home if user is already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Form Column */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <AuthForm />
      </div>

      {/* Hero Column */}
      <div className="flex-1 bg-primary p-12 hidden lg:flex flex-col justify-center text-white">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <GraduationCap size={40} />
            <h1 className="text-3xl font-bold ml-3">Meritorious</h1>
          </div>

          <h2 className="text-2xl font-semibold mb-4">
            Exam Preparation Platform
          </h2>
          
          <p className="mb-6">
            Welcome to the Meritorious Exam Preparation Platform, your comprehensive 
            solution for online test preparation and assessment. Our platform offers 
            a wide range of tests, detailed analytics, and personalized feedback to 
            help you excel in your exams.
          </p>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Comprehensive Test Library</h3>
                <p className="text-white text-opacity-80">Access a wide range of tests in various subjects and difficulty levels.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Real-time Performance Tracking</h3>
                <p className="text-white text-opacity-80">Monitor your progress with detailed analytics and insights.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Personalized Learning Experience</h3>
                <p className="text-white text-opacity-80">Get customized recommendations based on your performance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
