import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type QuestionStatus = "current" | "answered" | "unanswered";

type QuestionNavigationProps = {
  questions: {
    id: number;
    status: QuestionStatus;
  }[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
};

export default function QuestionNavigation({
  questions,
  currentQuestionIndex,
  onSelectQuestion
}: QuestionNavigationProps) {
  const questionsAnswered = questions.filter(q => q.status === "answered").length;
  const progress = questions.length > 0 ? (questionsAnswered / questions.length) * 100 : 0;

  return (
    <div className="w-64 bg-gray-50 border-r overflow-y-auto p-4 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="font-medium text-gray-700 mb-2">Question Navigation</h2>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => (
            <Button
              key={question.id}
              variant="ghost"
              size="icon"
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                question.status === "current" && "bg-primary text-white hover:bg-primary/90",
                question.status === "answered" && "bg-accent text-white hover:bg-accent/90",
                question.status === "unanswered" && "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => onSelectQuestion(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="font-medium text-gray-700 mb-2">Legend</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
            <span>Current Question</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-accent mr-2"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-white border border-gray-300 mr-2"></div>
            <span>Not Answered</span>
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t">
        <div className="text-sm text-gray-700 mb-2">
          <span className="font-medium">Progress:</span> {questionsAnswered}/{questions.length} questions
        </div>
        <Progress value={progress} className="h-2.5" />
      </div>
    </div>
  );
}
