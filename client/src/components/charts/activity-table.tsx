import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type ActivityStatus = "passed" | "in_progress" | "new" | "failed";

type ActivityItem = {
  id: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  action: string;
  test?: string;
  time: string;
  status: ActivityStatus;
};

type ActivityTableProps = {
  activities: ActivityItem[];
  onViewAll?: () => void;
};

const getStatusBadge = (status: ActivityStatus) => {
  switch (status) {
    case "passed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Passed</Badge>;
    case "in_progress":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">In Progress</Badge>;
    case "new":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">New</Badge>;
    case "failed":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function ActivityTable({ activities, onViewAll }: ActivityTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{activity.user.name}</div>
                        <div className="text-sm text-gray-500">{activity.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm text-gray-900">{activity.action}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm text-gray-900">{activity.test || "-"}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-500">
                    {activity.time}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {getStatusBadge(activity.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {onViewAll && (
        <CardFooter className="px-6 py-3 border-t bg-gray-50 flex justify-end">
          <button 
            className="text-sm font-medium text-primary hover:text-indigo-700"
            onClick={onViewAll}
          >
            View all activity →
          </button>
        </CardFooter>
      )}
    </Card>
  );
}
