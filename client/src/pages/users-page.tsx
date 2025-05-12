import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Ban, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect if not a librarian
  if (user && user.role !== "librarian") {
    return <Redirect to="/" />;
  }

  // Fetch users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Mutation for toggling user block status
  const toggleBlockMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest(
        "PATCH",
        `/api/users/${userId}/toggle-block`,
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the users list after successful block/unblock
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Успешно",
        description: "Статус пользователя успешно обновлен",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  // Get initial of name for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random color for avatar based on user id
  const getAvatarColor = (id: number) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Управление пользователями</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : users && users.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userData) => (
                  <TableRow
                    key={userData.id}
                    className={userData.isBlocked ? "bg-red-50" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className={getAvatarColor(userData.id)}>
                          <AvatarFallback>
                            {getInitials(userData.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{userData.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{userData.username}</TableCell>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          userData.role === "librarian"
                            ? "bg-primary/10 text-primary"
                            : "bg-slate-100 text-slate-800"
                        }
                      >
                        {userData.role.charAt(0).toUpperCase() +
                          userData.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={userData.isBlocked ? "destructive" : "outline"}
                        className={
                          userData.isBlocked
                            ? ""
                            : "bg-green-100 text-green-800 hover:bg-green-100"
                        }
                      >
                        {userData.isBlocked ? "Заблокирован" : "Активен"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {userData.id !== user?.id && (
                        <Button
                          variant={
                            userData.isBlocked ? "outline" : "destructive"
                          }
                          size="sm"
                          onClick={() =>
                            toggleBlockMutation.mutate(userData.id)
                          }
                          disabled={toggleBlockMutation.isPending}
                        >
                          {toggleBlockMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : userData.isBlocked ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <Ban className="h-4 w-4 mr-2" />
                          )}
                          {userData.isBlocked
                            ? "Разблокировать"
                            : "Заблокировать"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <h3 className="mt-4 text-lg font-medium">No users found</h3>
          <p className="mt-2 text-sm text-slate-500">
            There are no registered users in the system.
          </p>
        </div>
      )}
    </div>
  );
}
