import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import StatCard from "@/components/charts/stat-card";
import ActivityTable from "@/components/charts/activity-table";
import TestCard from "@/components/test/test-card";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CheckCircle, Edit, Eye } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sample activity data
const recentActivities = [
  {
    id: "1",
    user: {
      name: "Test User",
      email: "test@example.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
    },
    action: "Completed Test",
    test: "Introduction to Database",
    time: "10 minutes ago",
    status: "passed" as const
  },
  {
    id: "2",
    user: {
      name: "CSI User",
      email: "csi@it.com",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
    },
    action: "Started Test",
    test: "Advanced SQL",
    time: "30 minutes ago",
    status: "in_progress" as const
  },
  {
    id: "3",
    user: {
      name: "New Student",
      email: "student@example.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
    },
    action: "Registered",
    time: "2 hours ago",
    status: "new" as const
  }
];

// Sample test data
const availableTests = [
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

// Sample user data for admin view
const recentUsers = [
  {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 2,
    name: "CSI User",
    email: "csi@it.com",
    role: "teacher" as const,
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 3,
    name: "New Student",
    email: "student@example.com",
    role: "user" as const,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 4,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin" as const,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";

  // Fetch user exam attempts for statistics (would connect to real API)
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: async () => ({
      userCount: 237,
      activeTests: 24,
      testAttempts: 1249
    }),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

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
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Users"
          value={userStats?.userCount || 0}
          icon={<Users size={18} />}
          changeType="increase"
          changeValue="12%"
          changeText="from last month"
        />
        
        <StatCard
          title="Active Tests"
          value={userStats?.activeTests || 0}
          icon={<FileText size={18} />}
          changeType="increase"
          changeValue="8%"
          changeText="from last month"
        />
        
        <StatCard
          title="Test Attempts"
          value={userStats?.testAttempts || 0}
          icon={<CheckCircle size={18} />}
          changeType="increase"
          changeValue="24%"
          changeText="from last month"
        />
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <ActivityTable activities={recentActivities} onViewAll={() => console.log("View all activity")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Tests */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Available Tests</CardTitle>
              {(isAdmin || isTeacher) && (
                <Link href="/admin/test-management">
                  <Button size="sm" className="h-8">
                    <FileText className="mr-2 h-4 w-4" /> Add New Test
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {availableTests.map(test => (
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
              ))}
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-3 justify-end">
              <Link href="/tests">
                <Button variant="link" className="h-auto p-0">
                  View all tests →
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Users (Admin view) or User Stats (Regular user view) */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{isAdmin ? "Recent Users" : "Your Results"}</CardTitle>
            </CardHeader>
            <CardContent>
              {isAdmin ? (
                // Admin View: Recent Users
                <div className="space-y-4">
                  {recentUsers.map(user => (
                    <div key={user.id} className="flex items-center pb-4 border-b last:border-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="ml-auto">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                          user.role === 'teacher' ? 'bg-purple-100 text-purple-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 
                           user.role === 'teacher' ? 'Teacher' : 'User'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // User View: Personal Stats
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Tests Taken</h3>
                      <span className="text-2xl font-bold">5</span>
                    </div>
                    <div className="w-full bg-gray-300 h-2 rounded-full">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Average Score</h3>
                      <span className="text-2xl font-bold">76%</span>
                    </div>
                    <div className="w-full bg-gray-300 h-2 rounded-full">
                      <div className="bg-accent h-2 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Completion Rate</h3>
                      <span className="text-2xl font-bold">92%</span>
                    </div>
                    <div className="w-full bg-gray-300 h-2 rounded-full">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-3 justify-center">
              {isAdmin ? (
                <Link href="/admin/users">
                  <Button variant="outline" size="sm">
                    Manage Users
                  </Button>
                </Link>
              ) : (
                <Link href="/results">
                  <Button variant="outline" size="sm">
                    View Detailed Results
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
