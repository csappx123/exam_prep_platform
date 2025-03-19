import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import TestCard from "@/components/test/test-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

type Test = {
  id: number;
  name: string;
  description: string;
  duration: number;
  questionCount: number;
  publishDate: string;
  status: "active" | "draft" | "expired";
};

export default function TestsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("publishDate");
  
  // Fetch tests from the API
  const { data: tests, isLoading } = useQuery({
    queryKey: ["/api/exams"],
    staleTime: 60 * 1000 // 1 minute
  });
  
  // Sample tests if API call isn't working yet
  const sampleTests: Test[] = [
    {
      id: 1,
      name: "Introduction to Database Design",
      description: "Basic concepts of database design and normalization",
      duration: 60,
      questionCount: 30,
      publishDate: "2024-05-10T00:00:00.000Z",
      status: "active"
    },
    {
      id: 2,
      name: "Advanced SQL Queries",
      description: "Complex SQL queries and performance optimization",
      duration: 90,
      questionCount: 25,
      publishDate: "2024-05-15T00:00:00.000Z",
      status: "active"
    },
    {
      id: 3,
      name: "Database Security Principles",
      description: "Security best practices for database administration",
      duration: 75,
      questionCount: 20,
      publishDate: "2024-05-18T00:00:00.000Z",
      status: "draft"
    },
    {
      id: 4,
      name: "NoSQL Database Systems",
      description: "Introduction to NoSQL databases and their use cases",
      duration: 60,
      questionCount: 35,
      publishDate: "2024-05-05T00:00:00.000Z",
      status: "active"
    },
    {
      id: 5,
      name: "Database Performance Tuning",
      description: "Optimize database performance through indexing and query optimization",
      duration: 120,
      questionCount: 40,
      publishDate: "2024-05-20T00:00:00.000Z",
      status: "active"
    }
  ];
  
  const testsToDisplay = tests || sampleTests;
  
  // Filter tests by search term
  const filteredTests = testsToDisplay.filter(test => 
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort tests by selected criterion
  const sortedTests = [...filteredTests].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "duration") {
      return a.duration - b.duration;
    } else if (sortBy === "questionCount") {
      return a.questionCount - b.questionCount;
    } else { // publishDate
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    }
  });
  
  // For teacher/admin, show all tests; for regular users, show only active tests
  const visibleTests = isAdmin || isTeacher 
    ? sortedTests 
    : sortedTests.filter(test => test.status === "active");
  
  const handleEditTest = (id: number) => {
    console.log(`Edit test with id: ${id}`);
  };

  const handlePreviewTest = (id: number) => {
    console.log(`Preview test with id: ${id}`);
  };

  const handlePublishTest = (id: number) => {
    console.log(`Publish test with id: ${id}`);
  };
  
  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Available Tests</h1>
          <p className="text-gray-600">Browse and take tests to improve your skills</p>
        </div>
        
        {(isAdmin || isTeacher) && (
          <Link href="/admin/test-management?action=create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Test
            </Button>
          </Link>
        )}
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filter Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search tests..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publishDate">Newest First</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="questionCount">Number of Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-end">
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : visibleTests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No tests found matching your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          visibleTests.map(test => (
            <TestCard
              key={test.id}
              id={test.id}
              name={test.name}
              description={test.description}
              duration={test.duration}
              questionCount={test.questionCount}
              publishDate={test.publishDate}
              status={test.status}
              onEdit={isAdmin || isTeacher ? () => handleEditTest(test.id) : undefined}
              onPreview={isAdmin || isTeacher ? () => handlePreviewTest(test.id) : undefined}
              onPublish={isAdmin || isTeacher && test.status === 'draft' ? () => handlePublishTest(test.id) : undefined}
              isAdmin={isAdmin || isTeacher}
            />
          ))
        )}
      </div>
    </Layout>
  );
}
