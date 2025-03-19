import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, HelpCircle, Edit, Eye } from "lucide-react";
import { Link } from "wouter";

type TestCardProps = {
  id: number;
  name: string;
  description: string;
  duration: number;
  questionCount: number;
  publishDate: string;
  status: "active" | "draft" | "expired";
  onEdit?: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
  isAdmin?: boolean;
};

export default function TestCard({
  id,
  name,
  description,
  duration,
  questionCount,
  publishDate,
  status,
  onEdit,
  onPreview,
  onPublish,
  isAdmin = false
}: TestCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
    }
  };

  const formattedDate = new Date(publishDate);
  const timeAgo = formatDistance(formattedDate, new Date(), { addSuffix: true });

  return (
    <Card className="mb-4 border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-800">{name}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="mt-4 flex items-center text-sm text-gray-500 flex-wrap gap-2">
          <span className="flex items-center mr-4">
            <Clock className="h-4 w-4 mr-1" /> {duration} minutes
          </span>
          <span className="flex items-center mr-4">
            <HelpCircle className="h-4 w-4 mr-1" /> {questionCount} questions
          </span>
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" /> 
            {status === "draft" ? `Last edited: ${timeAgo}` : `Published: ${timeAgo}`}
          </span>
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          {isAdmin ? (
            <>
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onEdit}
                  className="px-3 py-1 h-auto"
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
              {onPreview && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={onPreview}
                  className="px-3 py-1 h-auto"
                >
                  <Eye className="h-4 w-4 mr-1" /> Preview
                </Button>
              )}
              {status === "draft" && onPublish && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={onPublish}
                  className="px-3 py-1 h-auto bg-green-600 hover:bg-green-700"
                >
                  Publish
                </Button>
              )}
            </>
          ) : (
            <Link href={`/tests/take/${id}`}>
              <Button size="sm" className="px-3 py-1 h-auto">
                Take Test
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
