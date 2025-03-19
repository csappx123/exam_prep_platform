import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import Layout from "@/components/layout/layout";
import QuestionNavigation from "@/components/test/question-navigation";
import TestQuestion from "@/components/test/test-question";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTimer } from "@/hooks/use-timer";
import { useTest, useTestActions, TestQuestion as QuestionType } from "@/hooks/use-tests";
import { Clock, AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TakeTestPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [flattenedQuestions, setFlattenedQuestions] = useState<QuestionType[]>([]);
  
  const { data: test, isLoading: isTestLoading, error: testError } = useTest(id);
  const { startTestMutation, submitAnswerMutation, submitTestMutation } = useTestActions();
  
  // Start the test when the component mounts
  useEffect(() => {
    if (test && !attemptId) {
      startTestMutation.mutate(test.examId, {
        onSuccess: (data) => {
          setAttemptId(data.attemptId);
        },
        onError: () => {
          // Navigate back to tests page on error
          navigate("/tests");
        }
      });
    }
  }, [test, attemptId]);
  
  // Flatten the questions from sections for easier navigation
  useEffect(() => {
    if (test?.sections) {
      const allQuestions = test.sections.flatMap(section => 
        section.questions.map(q => ({
          ...q,
          sectionName: section.name
        }))
      );
      setFlattenedQuestions(allQuestions);
    }
  }, [test]);
  
  // Set up the timer based on test duration
  const { formattedTime, isRunning, time } = useTimer({
    initialTime: test ? test.duration * 60 : 60 * 60, // Default to 60 minutes if test not loaded yet
    onTimeEnd: () => {
      if (attemptId) {
        handleSubmitTest();
      }
    },
    autoStart: !!attemptId // Start timer when attempt is created
  });
  
  // Get current question
  const currentQuestion = flattenedQuestions[currentQuestionIndex];
  
  // Convert questions to navigation format
  const navigationQuestions = flattenedQuestions.map((q, index) => ({
    id: q.questionId,
    status: index === currentQuestionIndex 
      ? "current" 
      : answers[q.questionId] ? "answered" : "unanswered"
  }));
  
  // Handle answer submission
  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Save the answer to the server
    if (attemptId) {
      submitAnswerMutation.mutate({
        attemptId,
        questionId,
        answer
      });
    }
  };
  
  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < flattenedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Submit the entire test
  const handleSubmitTest = () => {
    if (attemptId) {
      submitTestMutation.mutate(attemptId, {
        onSuccess: (data) => {
          navigate(`/tests/results/${attemptId}`);
        }
      });
    }
  };
  
  // Loading state
  if (isTestLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        <div className="flex flex-col h-screen">
          <header className="bg-white shadow-sm border-b py-4 px-6 flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </header>
          
          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 bg-gray-50 border-r overflow-y-auto p-4 hidden md:flex md:flex-col">
              <Skeleton className="h-4 w-32 mb-4" />
              <div className="grid grid-cols-5 gap-2">
                {Array(10).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 rounded-full" />
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                <Skeleton className="h-64 w-full mb-6" />
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (testError) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Test</h2>
          <p className="text-gray-600 mb-4">
            There was a problem loading the test. Please try again later.
          </p>
          <Button onClick={() => navigate("/tests")}>
            Return to Tests
          </Button>
        </div>
      </Layout>
    );
  }
  
  // If no test data yet, show minimal loading
  if (!test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-screen">
        {/* Test header */}
        <header className="bg-white shadow-sm border-b py-4 px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{test.examName}</h1>
            <p className="text-sm text-gray-500">{test.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2 text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>{formattedTime}</span> remaining
            </div>
            <Button onClick={() => setShowSubmitDialog(true)}>
              Submit Test
            </Button>
          </div>
        </header>
        
        {/* Test content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Question navigation */}
          <div className="w-64 bg-gray-50 border-r overflow-y-auto p-4 hidden md:block">
            <QuestionNavigation
              questions={navigationQuestions}
              currentQuestionIndex={currentQuestionIndex}
              onSelectQuestion={setCurrentQuestionIndex}
            />
          </div>
          
          {/* Question area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              {currentQuestion && (
                <TestQuestion
                  id={currentQuestionIndex + 1}
                  type={currentQuestion.questionType}
                  text={currentQuestion.questionText}
                  points={Number(currentQuestion.marks) || 1}
                  options={currentQuestion.options?.map(o => ({
                    id: o.optionId,
                    text: o.optionText
                  }))}
                  userAnswer={answers[currentQuestion.questionId] || ""}
                  onAnswer={handleAnswer}
                />
              )}
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                
                {currentQuestionIndex < flattenedQuestions.length - 1 ? (
                  <Button onClick={handleNextQuestion}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={() => setShowSubmitDialog(true)}>
                    Submit Test
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Submit test confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your test? You won't be able to change your answers after submission.
              
              {flattenedQuestions.length > 0 && (
                <Card className="mt-4">
                  <CardContent className="pt-4">
                    <p><strong>Test Progress:</strong></p>
                    <p className="text-sm mt-1">
                      {Object.keys(answers).length} of {flattenedQuestions.length} questions answered
                      ({Math.round((Object.keys(answers).length / flattenedQuestions.length) * 100)}%)
                    </p>
                    {Object.keys(answers).length < flattenedQuestions.length && (
                      <p className="text-amber-600 text-sm mt-2">
                        <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                        You have unanswered questions.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmitTest}
              disabled={submitTestMutation.isPending}
            >
              {submitTestMutation.isPending ? "Submitting..." : "Submit Test"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
