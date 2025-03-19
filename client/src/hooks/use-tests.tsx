import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types
export type TestQuestion = {
  id: number;
  type: "mcq" | "true_false" | "fill_in";
  text: string;
  points: number;
  options?: {
    id: number;
    text: string;
    isCorrect?: boolean;
  }[];
  correctAnswer?: string;
};

export type TestSection = {
  id: number;
  name: string;
  description: string;
  position: number;
  questions: TestQuestion[];
};

export type Test = {
  id: number;
  name: string;
  description: string;
  duration: number; // in minutes
  instructions: string;
  publishDate: string;
  isActive: boolean;
  createdBy: number;
  sections: TestSection[];
};

export type TestAttempt = {
  id: number;
  testId: number;
  startTime: string;
  endTime?: string;
  score?: number;
  status: "in_progress" | "completed" | "abandoned";
};

export type TestAnswer = {
  questionId: number;
  answer: string;
  isCorrect?: boolean;
  marksObtained?: number;
};

// Hook for fetching a test
export function useTest(testId: string | number) {
  return useQuery({
    queryKey: [`/api/exams/${testId}`],
    enabled: !!testId
  });
}

// Hook for fetching user test attempts
export function useUserTestAttempts() {
  return useQuery({
    queryKey: ["/api/user/attempts"]
  });
}

// Hook for fetching test attempt details
export function useTestAttempt(attemptId: string | number) {
  return useQuery({
    queryKey: [`/api/attempts/${attemptId}/results`],
    enabled: !!attemptId
  });
}

// Hook for test taking actions
export function useTestActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Start a new test attempt
  const startTestMutation = useMutation({
    mutationFn: async (testId: number) => {
      const res = await apiRequest("POST", "/api/attempts", { examId: testId });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/attempts"] });
      toast({
        title: "Test started",
        description: "Good luck with your test!",
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start test",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit an answer for a question
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ attemptId, questionId, answer }: { attemptId: number; questionId: number; answer: string }) => {
      const res = await apiRequest("POST", "/api/answers", {
        attemptId,
        questionId,
        userAnswer: answer
      });
      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save answer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit the entire test
  const submitTestMutation = useMutation({
    mutationFn: async (attemptId: number) => {
      const res = await apiRequest("POST", `/api/attempts/${attemptId}/submit`, {});
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/attempts"] });
      toast({
        title: "Test submitted",
        description: "Your test has been submitted successfully.",
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit test",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    startTestMutation,
    submitAnswerMutation,
    submitTestMutation
  };
}
