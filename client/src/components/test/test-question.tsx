import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type QuestionType = "mcq" | "true_false" | "fill_in";

type Option = {
  id: number;
  text: string;
  isCorrect?: boolean; // Only used in results view
};

type QuestionProps = {
  id: number;
  type: QuestionType;
  text: string;
  points: number;
  options?: Option[];
  userAnswer?: string | null;
  correctAnswer?: string; // Only used in results view
  showResults?: boolean;
  onAnswer: (questionId: number, answer: string) => void;
};

export default function TestQuestion({
  id,
  type,
  text,
  points,
  options = [],
  userAnswer,
  correctAnswer,
  showResults = false,
  onAnswer
}: QuestionProps) {
  const [fillInAnswer, setFillInAnswer] = useState(userAnswer || "");
  
  const handleOptionSelect = (value: string) => {
    onAnswer(id, value);
  };
  
  const handleFillInBlur = () => {
    onAnswer(id, fillInAnswer);
  };
  
  const isCorrect = showResults && userAnswer === correctAnswer;
  const isIncorrect = showResults && userAnswer !== correctAnswer && userAnswer !== null && userAnswer !== undefined;
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="mb-4">
          <Badge variant="outline" className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
            Question {id} • {points} {points === 1 ? "point" : "points"}
          </Badge>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2">{text}</h2>
          {type === "mcq" && <p className="text-gray-600 text-sm mb-4">Select the best option below.</p>}
          {type === "true_false" && <p className="text-gray-600 text-sm mb-4">Select True or False.</p>}
          {type === "fill_in" && <p className="text-gray-600 text-sm mb-4">Fill in your answer below.</p>}
        </div>
        
        {showResults && (
          <div className={`p-3 rounded-lg mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : isIncorrect ? 'bg-red-50 border border-red-200' : ''}`}>
            <p className={`font-medium ${isCorrect ? 'text-green-700' : isIncorrect ? 'text-red-700' : 'text-gray-700'}`}>
              {isCorrect ? '✓ Correct answer!' : isIncorrect ? '✗ Incorrect answer' : userAnswer ? 'Your answer:' : 'Not answered'}
            </p>
            {isIncorrect && <p className="text-sm text-gray-600 mt-1">Correct answer: {correctAnswer}</p>}
          </div>
        )}
        
        {type === "mcq" && (
          <RadioGroup 
            value={userAnswer || ""}
            onValueChange={handleOptionSelect}
            disabled={showResults}
            className="space-y-3"
          >
            {options.map((option) => (
              <div 
                key={option.id} 
                className={cn(
                  "flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer",
                  showResults && option.isCorrect && "bg-green-50 border-green-200",
                  showResults && userAnswer === option.id.toString() && !option.isCorrect && "bg-red-50 border-red-200"
                )}
              >
                <RadioGroupItem 
                  id={`option-${option.id}`} 
                  value={option.id.toString()} 
                  className="mt-0.5 h-4 w-4" 
                />
                <Label 
                  htmlFor={`option-${option.id}`} 
                  className="ml-3 text-gray-700 cursor-pointer flex-grow"
                >
                  {option.text}
                </Label>
                {showResults && option.isCorrect && (
                  <span className="text-green-600 ml-2">✓</span>
                )}
              </div>
            ))}
          </RadioGroup>
        )}
        
        {type === "true_false" && (
          <RadioGroup 
            value={userAnswer || ""}
            onValueChange={handleOptionSelect}
            disabled={showResults}
            className="space-y-3"
          >
            <div 
              className={cn(
                "flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer",
                showResults && correctAnswer === "true" && "bg-green-50 border-green-200",
                showResults && userAnswer === "true" && correctAnswer !== "true" && "bg-red-50 border-red-200"
              )}
            >
              <RadioGroupItem id="true" value="true" className="mt-0.5 h-4 w-4" />
              <Label htmlFor="true" className="ml-3 text-gray-700 cursor-pointer">
                True
              </Label>
            </div>
            
            <div 
              className={cn(
                "flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer",
                showResults && correctAnswer === "false" && "bg-green-50 border-green-200",
                showResults && userAnswer === "false" && correctAnswer !== "false" && "bg-red-50 border-red-200"
              )}
            >
              <RadioGroupItem id="false" value="false" className="mt-0.5 h-4 w-4" />
              <Label htmlFor="false" className="ml-3 text-gray-700 cursor-pointer">
                False
              </Label>
            </div>
          </RadioGroup>
        )}
        
        {type === "fill_in" && (
          <div>
            <Input
              type="text"
              placeholder="Your answer"
              value={fillInAnswer}
              onChange={(e) => setFillInAnswer(e.target.value)}
              onBlur={handleFillInBlur}
              disabled={showResults}
              className={cn(
                "w-full",
                showResults && isCorrect && "border-green-500 text-green-700",
                showResults && isIncorrect && "border-red-500 text-red-700"
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
