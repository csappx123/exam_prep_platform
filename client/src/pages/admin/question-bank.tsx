import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Trash2, Edit, Eye, CheckCircle2, HelpCircle, FileQuestion } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Question form schema
const questionSchema = z.object({
  questionType: z.enum(["mcq", "true_false", "fill_in"]),
  questionText: z.string().min(5, "Question text must be at least 5 characters"),
  sectionId: z.number().int().positive("Section is required"),
  solutionText: z.string().optional(),
  correctAnswer: z.string().optional(),
  marks: z.coerce.number().positive("Marks must be positive"),
  position: z.coerce.number().int().nonnegative(),
  options: z.array(
    z.object({
      optionText: z.string().min(1, "Option text is required"),
      isCorrect: z.boolean().default(false),
      position: z.coerce.number().int().nonnegative()
    })
  )
    .optional()
    .refine(
      (options) => {
        if (!options) return true;
        return options.some(option => option.isCorrect);
      },
      {
        message: "At least one option must be marked as correct",
        path: ["options"]
      }
    )
});

type QuestionFormValues = z.infer<typeof questionSchema>;

// Sample sections for dropdown
const sampleSections = [
  { id: 1, name: "Database Basics", examId: 1 },
  { id: 2, name: "SQL Fundamentals", examId: 1 },
  { id: 3, name: "Database Design", examId: 1 },
  { id: 4, name: "Advanced SQL", examId: 2 },
  { id: 5, name: "Performance Optimization", examId: 2 }
];

// Sample questions for display
const sampleQuestions = [
  {
    id: 1,
    type: "mcq",
    text: "What is the primary purpose of database normalization?",
    sectionId: 1,
    sectionName: "Database Basics",
    examName: "Introduction to Database Design",
    marks: 1,
    options: [
      { id: 1, text: "To optimize query performance by creating more tables", isCorrect: false },
      { id: 2, text: "To reduce data redundancy and improve data integrity", isCorrect: true },
      { id: 3, text: "To make database design more complex and secure", isCorrect: false },
      { id: 4, text: "To ensure all data is stored in a single, large table", isCorrect: false }
    ]
  },
  {
    id: 2,
    type: "true_false",
    text: "A foreign key can reference any column in another table, even if it's not a primary key or unique.",
    sectionId: 3,
    sectionName: "Database Design",
    examName: "Introduction to Database Design",
    marks: 1,
    correctAnswer: "false"
  },
  {
    id: 3,
    type: "fill_in",
    text: "The SQL command to retrieve data from a database is _______.",
    sectionId: 2,
    sectionName: "SQL Fundamentals",
    examName: "Introduction to Database Design",
    marks: 1,
    correctAnswer: "SELECT"
  }
];

export default function QuestionBankPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Form for adding/editing questions
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionType: "mcq",
      questionText: "",
      sectionId: 0,
      solutionText: "",
      correctAnswer: "",
      marks: 1,
      position: 0,
      options: [
        { optionText: "", isCorrect: false, position: 0 },
        { optionText: "", isCorrect: false, position: 1 },
        { optionText: "", isCorrect: false, position: 2 },
        { optionText: "", isCorrect: false, position: 3 }
      ]
    }
  });
  
  // Field array for options
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options"
  });
  
  // Watch question type to show the right form fields
  const questionType = form.watch("questionType");
  
  // Reset form when dialog opens/closes
  const handleOpenDialog = (questionId?: number) => {
    if (questionId) {
      // Find the question to edit
      const questionToEdit = sampleQuestions.find(q => q.id === questionId);
      if (questionToEdit) {
        form.reset({
          questionType: questionToEdit.type,
          questionText: questionToEdit.text,
          sectionId: questionToEdit.sectionId,
          solutionText: "",
          correctAnswer: questionToEdit.correctAnswer || "",
          marks: questionToEdit.marks,
          position: 0,
          options: questionToEdit.options?.map((opt, index) => ({
            optionText: opt.text,
            isCorrect: opt.isCorrect,
            position: index
          })) || []
        });
        setEditQuestionId(questionId);
      }
    } else {
      form.reset();
      setEditQuestionId(null);
    }
    setIsAddDialogOpen(true);
  };
  
  // Submit form handler
  const onSubmit = (data: QuestionFormValues) => {
    console.log("Form data:", data);
    // Here you would call the API to create/update the question
    
    toast({
      title: editQuestionId ? "Question Updated" : "Question Created",
      description: `Your question has been ${editQuestionId ? "updated" : "created"} successfully.`
    });
    
    setIsAddDialogOpen(false);
    form.reset();
  };
  
  // Filter questions based on search and question type
  const filteredQuestions = sampleQuestions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedQuestionType === "all" || question.type === selectedQuestionType;
    
    return matchesSearch && matchesType;
  });
  
  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Question Bank</h1>
          <p className="text-gray-600">Create and manage questions for your tests</p>
        </div>
        
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add New Question
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filter Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search questions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Tabs 
              value={selectedQuestionType} 
              onValueChange={setSelectedQuestionType}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Types</TabsTrigger>
                <TabsTrigger value="mcq">MCQ</TabsTrigger>
                <TabsTrigger value="true_false">True/False</TabsTrigger>
                <TabsTrigger value="fill_in">Fill-in</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6">
        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No questions found</h3>
              <p className="text-gray-500 mb-6">
                No questions match your current filters. Try adjusting your search or add a new question.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                Add New Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map(question => (
            <Card key={question.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        question.type === 'mcq' ? 'bg-blue-100 text-blue-800' :
                        question.type === 'true_false' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {question.type === 'mcq' ? 'Multiple Choice' :
                         question.type === 'true_false' ? 'True/False' :
                         'Fill in the Blank'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {question.examName} • {question.sectionName}
                      </span>
                    </div>
                    <CardTitle className="text-base font-medium">{question.text}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleOpenDialog(question.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {question.type === 'mcq' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {question.options?.map((option, index) => (
                      <div 
                        key={option.id}
                        className={`p-2 rounded-md border ${option.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                      >
                        <div className="flex items-start">
                          {option.isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />}
                          <span className={option.isCorrect ? 'text-green-800' : 'text-gray-700'}>
                            {option.text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {question.type === 'true_false' && (
                  <div className="mt-2">
                    <span className="font-medium text-gray-700">Correct answer: </span>
                    <span className="text-green-700">
                      {question.correctAnswer === 'true' ? 'True' : 'False'}
                    </span>
                  </div>
                )}
                
                {question.type === 'fill_in' && (
                  <div className="mt-2">
                    <span className="font-medium text-gray-700">Correct answer: </span>
                    <span className="text-green-700">{question.correctAnswer}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-gray-50 text-sm text-gray-500">
                {question.marks} {question.marks === 1 ? 'point' : 'points'}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      {/* Add/Edit Question Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editQuestionId ? 'Edit Question' : 'Add New Question'}</DialogTitle>
            <DialogDescription>
              {editQuestionId 
                ? 'Update your existing question below.' 
                : 'Create a new question for your test. Choose the question type and enter the details.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questionType">Question Type</Label>
                <Select
                  defaultValue={form.getValues("questionType")}
                  onValueChange={(value) => form.setValue("questionType", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="fill_in">Fill in the Blank</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.questionType && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.questionType.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="sectionId">Section</Label>
                <Select
                  defaultValue={form.getValues("sectionId").toString()}
                  onValueChange={(value) => form.setValue("sectionId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleSections.map(section => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.sectionId && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.sectionId.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="questionText">Question Text</Label>
              <Textarea
                id="questionText"
                placeholder="Enter your question"
                rows={3}
                {...form.register("questionText")}
              />
              {form.formState.errors.questionText && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.questionText.message}</p>
              )}
            </div>
            
            {questionType === "mcq" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Answer Options</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => append({ optionText: "", isCorrect: false, position: fields.length })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Option
                  </Button>
                </div>
                
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start mb-3 space-x-2">
                    <div className="flex-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        {...form.register(`options.${index}.optionText`)}
                      />
                      {form.formState.errors.options?.[index]?.optionText && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.options[index]?.optionText?.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        checked={form.getValues(`options.${index}.isCorrect`)}
                        onCheckedChange={(checked) => {
                          form.setValue(`options.${index}.isCorrect`, checked);
                        }}
                      />
                      <Label htmlFor={`options.${index}.isCorrect`} className="text-sm">
                        Correct
                      </Label>
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 2}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                
                {form.formState.errors.options && typeof form.formState.errors.options.message === 'string' && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.options.message}</p>
                )}
              </div>
            )}
            
            {questionType === "true_false" && (
              <div>
                <Label>Correct Answer</Label>
                <RadioGroup
                  defaultValue={form.getValues("correctAnswer")}
                  onValueChange={(value) => form.setValue("correctAnswer", value)}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true">True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false">False</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.correctAnswer && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.correctAnswer.message}</p>
                )}
              </div>
            )}
            
            {questionType === "fill_in" && (
              <div>
                <Label htmlFor="correctAnswer">Correct Answer</Label>
                <Input
                  id="correctAnswer"
                  placeholder="Enter the correct answer"
                  {...form.register("correctAnswer")}
                />
                {form.formState.errors.correctAnswer && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.correctAnswer.message}</p>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marks">Points</Label>
                <Input
                  id="marks"
                  type="number"
                  min="0.5"
                  step="0.5"
                  {...form.register("marks")}
                />
                {form.formState.errors.marks && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.marks.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="position">Position in Section</Label>
                <Input
                  id="position"
                  type="number"
                  min="0"
                  step="1"
                  {...form.register("position")}
                />
                {form.formState.errors.position && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.position.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="solutionText">Solution/Explanation (Optional)</Label>
              <Textarea
                id="solutionText"
                placeholder="Enter solution or explanation for this question"
                rows={2}
                {...form.register("solutionText")}
              />
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">
                {editQuestionId ? 'Update Question' : 'Add Question'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
