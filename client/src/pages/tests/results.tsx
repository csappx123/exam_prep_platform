import { useParams, useLocation } from "wouter";
import { useEffect } from "react";
import Layout from "@/components/layout/layout";
import TestQuestion from "@/components/test/test-question";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTestAttempt } from "@/hooks/use-tests";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, FileText, BarChart3 } from "lucide-react";
import { formatDistance } from "date-fns";

export default function TestResultsPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  
  const { data: attemptResult, isLoading, error } = useTestAttempt(id);
  
  // Format test duration to "X minutes"
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`;
    }
  };
  
  // Calculate time spent on the test
  const calculateTimeSpent = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    
    return formatDuration(durationMinutes);
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Skeleton className="h-8 w-48 md:w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  if (error || !attemptResult) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">
            There was a problem loading your test results. Please try again later.
          </p>
          <Button onClick={() => navigate("/")}>
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }
  
  const { attempt, exam, answers } = attemptResult;
  
  // Calculate statistics
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const incorrectAnswers = answers.filter(a => a.isCorrect === false).length;
  const unansweredQuestions = totalQuestions - correctAnswers - incorrectAnswers;
  
  // Calculate percentages
  const percentCorrect = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const percentIncorrect = totalQuestions > 0 ? Math.round((incorrectAnswers / totalQuestions) * 100) : 0;
  const percentUnanswered = totalQuestions > 0 ? Math.round((unansweredQuestions / totalQuestions) * 100) : 0;
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{exam.examName} - Results</h1>
            <p className="text-gray-600">Completed {formatDistance(new Date(attempt.endTime), new Date(), { addSuffix: true })}</p>
          </div>
          
          <Button variant="outline" onClick={() => navigate("/tests")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Your Score</h3>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{attempt.score ? attempt.score.toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-green-200 h-2 rounded-full">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${attempt.score || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {correctAnswers} correct out of {totalQuestions} questions
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-gray-800">Time Spent</h3>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {calculateTimeSpent(attempt.startTime, attempt.endTime)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Test duration: {formatDuration(exam.duration)}
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-medium text-gray-800">Test Details</h3>
                </div>
                <p className="text-gray-800">
                  <span className="font-bold">{exam.examName}</span><br />
                  <span className="text-sm">{exam.description}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {totalQuestions} questions in total
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium text-gray-800 mb-4">Answer Distribution</h3>
              <div className="flex h-8 rounded-lg overflow-hidden">
                <div 
                  className="bg-green-500 text-white flex items-center justify-center text-xs font-medium"
                  style={{ width: `${percentCorrect}%` }}
                >
                  {percentCorrect > 10 ? `${percentCorrect}% Correct` : ''}
                </div>
                <div 
                  className="bg-red-500 text-white flex items-center justify-center text-xs font-medium"
                  style={{ width: `${percentIncorrect}%` }}
                >
                  {percentIncorrect > 10 ? `${percentIncorrect}% Incorrect` : ''}
                </div>
                <div 
                  className="bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-medium"
                  style={{ width: `${percentUnanswered}%` }}
                >
                  {percentUnanswered > 10 ? `${percentUnanswered}% Unanswered` : ''}
                </div>
              </div>
              <div className="flex text-sm mt-2 text-gray-600 justify-between">
                <div>
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span> Correct: {correctAnswers}
                </div>
                <div>
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span> Incorrect: {incorrectAnswers}
                </div>
                <div>
                  <span className="inline-block w-3 h-3 bg-gray-300 rounded-full mr-1"></span> Unanswered: {unansweredQuestions}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Question Review</CardTitle>
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" /> Detailed Analytics
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {answers.map((answer, index) => (
                <TestQuestion
                  key={answer.questionId}
                  id={index + 1}
                  type={answer.question.questionType}
                  text={answer.question.questionText}
                  points={Number(answer.question.marks) || 1}
                  options={answer.question.options?.map(o => ({
                    id: o.optionId,
                    text: o.optionText,
                    isCorrect: o.isCorrect
                  }))}
                  userAnswer={answer.userAnswer}
                  correctAnswer={answer.question.correctAnswer}
                  showResults={true}
                  onAnswer={() => {}} // No-op in results view
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
