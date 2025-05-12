import { useEffect, useState } from "react";
import { AppLayout } from "@/lib/protected-route";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfile, updateProfileSchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  const form = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      address: user?.address || "",
      bio: user?.bio || "",
    }
  });
  
  // Обновление формы при получении пользовательских данных
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        bio: user.bio || "",
      });
    }
  }, [user, form]);
  
  // Запрос детальных данных о пользователе
  const userQuery = useQuery({
    queryKey: ["/api/users", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`/api/users/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    },
    enabled: !!user?.id,
  });
  
  // Запрос истории заимствований пользователя
  const borrowsQuery = useQuery<any[]>({
    queryKey: ["/api/borrows"],
    enabled: !!user?.id,
    initialData: [],
  });
  
  // Мутация для обновления профиля
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      if (!user?.id) throw new Error("User ID not found");
      const res = await apiRequest("PATCH", `/api/users/${user.id}/profile`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("profile.updated"),
        description: t("profile.updateSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: t("profile.updateFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: UpdateProfile) => {
    updateProfileMutation.mutate(data);
  };
  
  if (userQuery.isLoading) {
    return (
      <AppLayout title={t("profile.title")}>
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout title={t("profile.title")}>
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">{t("profile.info")}</TabsTrigger>
          <TabsTrigger value="borrowings">{t("profile.borrowings")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.personalInfo")}</CardTitle>
              <CardDescription>{t("profile.personalInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.name")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.email")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.phone")}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.address")}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("profile.bio")}</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="min-w-32"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {t("profile.save")}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.accountInfo")}</CardTitle>
              <CardDescription>{t("profile.accountInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">{t("profile.username")}</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user?.username}</dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">{t("profile.role")}</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {user?.role === "librarian" ? t("auth.role.librarian") : t("auth.role.reader")}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">{t("profile.status")}</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {user?.isBlocked ? (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                        {t("profile.blocked")}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                        {t("profile.active")}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="borrowings">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.borrowings")}</CardTitle>
              <CardDescription>{t("profile.borrowingsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {borrowsQuery.isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : borrowsQuery.data?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("borrowing.book")}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("borrowing.borrowDate")}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("borrowing.dueDate")}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("borrowing.returnDate")}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("borrowing.status")}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {borrowsQuery.data.map((borrow: any) => (
                        <tr key={borrow.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{borrow.bookTitle || `Book #${borrow.bookId}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{new Date(borrow.borrowDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{new Date(borrow.dueDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {!borrow.returnDate ? (
                              new Date(borrow.dueDate) < new Date() ? (
                                <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                                  {t("borrowing.overdue")}
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                                  {t("borrowing.borrowed")}
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                {t("borrowing.returned")}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">{t("profile.noBorrowings")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}