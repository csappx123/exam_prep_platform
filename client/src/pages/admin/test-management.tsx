import { useState } from "react";
import { useLocation, useParams, Link as WouterLink } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TestCard from "@/components/test/test-card";
import { ArrowLeft, Plus, AlignJustify, Clock, CalendarClock, Info, HelpCircle } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Test form schema
const testSchema = z.object({
  examName: z.string().min(5, "Test name must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.coerce.number().int().min(5, "Duration must be at least 5 minutes"),
  instructions: z.string().optional(),
  isActive: z.boolean().default(false),
  publishDate: z.string().optional()
});

type TestFormValues = z.infer<typeof testSchema>;

// Sample tests data
const sampleTests = [
  {
    id: 1,
    name: "Introduction to Database Design",
    description: "Basic concepts of database design and normalization",
    duration: 60,
    questionCount: 30,
    publishDate: "2024-05-10T00:00:00.000Z",
    status: "active" as const
  },
  {
    id: 2,
    name: "Advanced SQL Queries",
    description: "Complex SQL queries and performance optimization",
    duration: 90,
    questionCount: 25,
    publishDate: "2024-05-15T00:00:00.000Z",
    status: "active" as const
  },
  {
    id: 3,
    name: "Database Security Principles",
    description: "Security best practices for database administration",
    duration: 75,
    questionCount: 20,
    publishDate: "2024-05-18T00:00:00.000Z",
    status: "draft" as const
  }
];

export default function TestManagementPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const action = searchParams.get('action') || 'list';
  const editId = searchParams.get('id');
  
  const [activeTab, setActiveTab] = useState("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all tests
  const { data: tests, isLoading } = useQuery({
    queryKey: ["/api/exams"],
    staleTime: 60 * 1000 // 1 minute
  });
  
  // Get single test for editing
  const { data: editTest } = useQuery({
    queryKey: [`/api/exams/${editId}`],
    enabled: !!editId
  });
  
  // Test form
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      examName: editTest?.examName || "",
      description: editTest?.description || "",
      duration: editTest?.duration || 60,
      instructions: editTest?.instructions || "",
      isActive: editTest?.isActive || false,
      publishDate: editTest?.publishDate ? new Date(editTest.publishDate).toISOString().split('T')[0] : undefined
    }
  });
  
  // Create test mutation
  const createTestMutation = useMutation({
    mutationFn: async (data: TestFormValues) => {
      const res = await apiRequest("POST", "/api/exams", {
        ...data,
        publishDate: data.publishDate ? new Date(data.publishDate) : undefined
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({
        title: "Success",
        description: "Test has been created successfully",
      });
      setLocation("/admin/test-management");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update test mutation
  const updateTestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TestFormValues }) => {
      const res = await apiRequest("PUT", `/api/exams/${id}`, {
        ...data,
        publishDate: data.publishDate ? new Date(data.publishDate) : undefined
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({
        title: "Success",
        description: "Test has been updated successfully",
      });
      setLocation("/admin/test-management");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete test mutation
  const deleteTestMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({
        title: "Success",
        description: "Test has been deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: TestFormValues) => {
    if (editId) {
      updateTestMutation.mutate({ id: editId, data });
    } else {
      createTestMutation.mutate(data);
    }
  };
  
  // Get filtered tests based on active tab
  const getFilteredTests = () => {
    const testsToUse = tests || sampleTests;
    
    if (activeTab === "all") {
      return testsToUse;
    } else if (activeTab === "active") {
      return testsToUse.filter(test => test.status === "active");
    } else if (activeTab === "draft") {
      return testsToUse.filter(test => test.status === "draft");
    } else {
      return testsToUse;
    }
  };
  
  const filteredTests = getFilteredTests();
  
  // If creating or editing a test
  if (action === 'create' || action === 'edit') {
    return (
      <Layout>
        <div className="mb-6 flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation("/admin/test-management")}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {action === 'create' ? 'Create New Test' : 'Edit Test'}
            </h1>
            <p className="text-gray-600">
              {action === 'create' 
                ? 'Create a new test for your students' 
                : 'Modify an existing test'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Test Information</CardTitle>
                <CardDescription>
                  Enter the basic details for your test
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="examName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter test name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide a brief description of the test"
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={5}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="publishDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Publish Date (optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>
                              Leave empty to publish immediately
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Instructions for test takers"
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Provide clear instructions for students taking the test
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Active Status
                            </FormLabel>
                            <FormDescription>
                              Make this test available to students
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createTestMutation.isPending || updateTestMutation.isPending}
                    >
                      {createTestMutation.isPending || updateTestMutation.isPending
                        ? "Saving..."
                        : action === 'create'
                        ? "Create Test"
                        : "Update Test"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Help & Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <AlignJustify className="h-5 w-5 text-primary mt-0.5 mr-2" />
                  <div>
                    <h3 className="font-medium text-gray-800">Test Structure</h3>
                    <p className="text-sm text-gray-600">
                      After creating the test, you can add sections and questions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-primary mt-0.5 mr-2" />
                  <div>
                    <h3 className="font-medium text-gray-800">Duration</h3>
                    <p className="text-sm text-gray-600">
                      Set a reasonable time limit based on the number and complexity of questions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CalendarClock className="h-5 w-5 text-primary mt-0.5 mr-2" />
                  <div>
                    <h3 className="font-medium text-gray-800">Publishing</h3>
                    <p className="text-sm text-gray-600">
                      You can set a future publish date or make the test active immediately.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-primary mt-0.5 mr-2" />
                  <div>
                    <h3 className="font-medium text-gray-800">Instructions</h3>
                    <p className="text-sm text-gray-600">
                      Provide clear instructions to help students understand what's expected.
                    </p>
                  </div>
                </div>
                
                <Alert className="mt-4">
                  <HelpCircle className="h-4 w-4" />
                  <AlertTitle>Need help?</AlertTitle>
                  <AlertDescription>
                    You can edit the test structure and questions after creating the basic test information.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Test listing page
  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Test Management</h1>
          <p className="text-gray-600">Create, edit and manage your tests</p>
        </div>
        
        <Button onClick={() => setLocation("/admin/test-management?action=create")}>
          <Plus className="mr-2 h-4 w-4" /> Create New Test
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your Tests</CardTitle>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="all">All Tests</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p>Loading tests...</p>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No tests found</h3>
              <p className="text-gray-500 mb-6">There are no tests in this category yet.</p>
              <Button 
                onClick={() => setLocation("/admin/test-management?action=create")}
              >
                Create Your First Test
              </Button>
            </div>
          ) : (
            filteredTests.map(test => (
              <TestCard
                key={test.id}
                id={test.id}
                name={test.name}
                description={test.description}
                duration={test.duration}
                questionCount={test.questionCount}
                publishDate={test.publishDate}
                status={test.status}
                isAdmin={true}
                onEdit={() => setLocation(`/admin/test-management?action=edit&id=${test.id}`)}
                onPreview={() => console.log(`Preview test ${test.id}`)}
                onPublish={() => console.log(`Publish test ${test.id}`)}
              />
            ))
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
