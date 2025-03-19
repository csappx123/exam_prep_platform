import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, UserCheck, UserX, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserRole = 'user' | 'teacher' | 'admin';

type UserCardProps = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  onEdit?: (id: number) => void;
  onChangeRole?: (id: number, role: UserRole) => void;
  onActivate?: (id: number) => void;
  onDeactivate?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export default function UserCard({
  id,
  name,
  email,
  role,
  avatar,
  onEdit,
  onChangeRole,
  onActivate,
  onDeactivate,
  onDelete
}: UserCardProps) {
  // Get initials from name
  const getInitials = (name: string): string => {
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return "bg-red-100 text-red-800";
      case 'teacher':
        return "bg-purple-100 text-purple-800";
      case 'user':
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          
          <div className="ml-3 flex-grow">
            <p className="text-sm font-medium text-gray-800">{name}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
          
          <Badge className={`${getRoleBadgeColor(role)}`}>
            {role === 'admin' ? 'Admin' : role === 'teacher' ? 'Teacher' : 'User'}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              
              {onChangeRole && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onChangeRole(id, 'user')}>
                    Set as User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeRole(id, 'teacher')}>
                    Set as Teacher
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeRole(id, 'admin')}>
                    Set as Admin
                  </DropdownMenuItem>
                </>
              )}
              
              {(onActivate || onDeactivate) && (
                <>
                  <DropdownMenuSeparator />
                  {onActivate && (
                    <DropdownMenuItem onClick={() => onActivate(id)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Activate
                    </DropdownMenuItem>
                  )}
                  {onDeactivate && (
                    <DropdownMenuItem onClick={() => onDeactivate(id)}>
                      <UserX className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  )}
                </>
              )}
              
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
