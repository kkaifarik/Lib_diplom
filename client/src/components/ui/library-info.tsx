import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { LibraryInfo as LibraryInfoType, InsertLibraryInfo } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Map, Phone, Mail, Clock, CalendarDays, Info } from "lucide-react";

// Schema for library info form
const libraryInfoSchema = z.object({
  name: z.string().min(1, { message: "Название обязательно" }),
  address: z.string().min(1, { message: "Адрес обязателен" }),
  phone: z.string().min(1, { message: "Телефон обязателен" }),
  email: z.string().email({ message: "Введите корректный email" }),
  openHours: z.string().min(1, { message: "Часы работы обязательны" }),
  description: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
});

type LibraryInfoFormValues = z.infer<typeof libraryInfoSchema>;

export function LibraryInfo() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch library info
  const { data: libraryInfo, isLoading } = useQuery<LibraryInfoType>({
    queryKey: ["/api/library-info"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) {
        if (res.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch library info: ${res.statusText}`);
      }
      return res.json();
    },
  });

  // Setup library info update mutation
  const updateLibraryInfoMutation = useMutation({
    mutationFn: async (data: InsertLibraryInfo) => {
      const res = await apiRequest("PUT", "/api/library-info", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/library-info"] });
      toast({
        title: t("library_info_updated_success_title"),
        description: t("library_info_updated_success_description"),
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t("library_info_update_error_title"),
        description: error.message || t("library_info_update_error_description"),
        variant: "destructive",
      });
    },
  });

  // Form for editing library info
  const form = useForm<LibraryInfoFormValues>({
    resolver: zodResolver(libraryInfoSchema),
    defaultValues: {
      name: libraryInfo?.name || "",
      address: libraryInfo?.address || "",
      phone: libraryInfo?.phone || "",
      email: libraryInfo?.email || "",
      openHours: libraryInfo?.openHours || "",
      description: libraryInfo?.description || "",
      logoUrl: libraryInfo?.logoUrl || "",
    },
  });

  // Update form values when libraryInfo changes
  useEffect(() => {
    if (libraryInfo) {
      form.reset({
        name: libraryInfo.name,
        address: libraryInfo.address,
        phone: libraryInfo.phone,
        email: libraryInfo.email,
        openHours: libraryInfo.openHours,
        description: libraryInfo.description || "",
        logoUrl: libraryInfo.logoUrl || "",
      });
    }
  }, [libraryInfo, form]);

  const onSubmit = (data: LibraryInfoFormValues) => {
    updateLibraryInfoMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-2 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full mt-4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no library info exists yet
  if (!libraryInfo) {
    if (user?.role === "librarian") {
      return (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{t("library_info_not_found_title")}</CardTitle>
            <CardDescription>{t("library_info_not_found_description")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>{t("library_info_add_button")}</Button>
              </DialogTrigger>
              <LibraryInfoEditDialog
                form={form}
                onSubmit={onSubmit}
                isLoading={updateLibraryInfoMutation.isPending}
              />
            </Dialog>
          </CardFooter>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{t("library_info_not_found_title")}</CardTitle>
          <CardDescription>{t("library_info_not_found_description")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">{libraryInfo.name}</CardTitle>
            <CardDescription>{t("library_info_subtitle")}</CardDescription>
          </div>
          {user?.role === "librarian" && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">{t("library_info_edit_button")}</Button>
              </DialogTrigger>
              <LibraryInfoEditDialog
                form={form}
                onSubmit={onSubmit}
                isLoading={updateLibraryInfoMutation.isPending}
              />
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col space-y-4 flex-1">
          <InfoItem 
            icon={<Map className="h-5 w-5 text-muted-foreground" />}
            label={t("library_info_address")}
            value={libraryInfo.address}
          />
          <InfoItem 
            icon={<Phone className="h-5 w-5 text-muted-foreground" />}
            label={t("library_info_phone")}
            value={libraryInfo.phone}
          />
          <InfoItem 
            icon={<Mail className="h-5 w-5 text-muted-foreground" />}
            label={t("library_info_email")}
            value={libraryInfo.email}
          />
          <InfoItem 
            icon={<Clock className="h-5 w-5 text-muted-foreground" />}
            label={t("library_info_open_hours")}
            value={libraryInfo.openHours}
          />
        </div>
        <div className="flex-1">
          {libraryInfo.description && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                {t("library_info_description")}
              </h3>
              <p className="text-sm">{libraryInfo.description}</p>
            </div>
          )}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1" />
                {t("library_info_last_updated")}: {new Date(libraryInfo.updatedAt).toLocaleDateString(
                  language === "ru" ? "ru-RU" : "en-US", 
                  { 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric"
                  }
                )}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Single information item for library info display
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
        {icon}
        <span className="ml-2">{label}</span>
      </h3>
      <p className="text-sm ml-7">{value}</p>
    </div>
  );
}

// Dialog for editing library info
function LibraryInfoEditDialog({ 
  form, 
  onSubmit, 
  isLoading 
}: { 
  form: any; 
  onSubmit: (data: LibraryInfoFormValues) => void; 
  isLoading: boolean; 
}) {
  const { t } = useLanguage();

  return (
    <DialogContent className="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle>{t("library_info_edit_dialog_title")}</DialogTitle>
        <DialogDescription>
          {t("library_info_edit_dialog_description")}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("library_info_form_name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("library_info_form_name_placeholder")} {...field} />
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
                <FormLabel>{t("library_info_form_address")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("library_info_form_address_placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("library_info_form_phone")}</FormLabel>
                  <FormControl>
                    <Input placeholder="+7 (XXX) XXX-XX-XX" {...field} />
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
                  <FormLabel>{t("library_info_form_email")}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="openHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("library_info_form_open_hours")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("library_info_form_open_hours_placeholder")} {...field} />
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
                <FormLabel>{t("library_info_form_description")}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={t("library_info_form_description_placeholder")} 
                    className="resize-none"
                    rows={3}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("library_info_form_logo_url")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("library_info_form_logo_url_placeholder")} {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  {t("library_info_form_logo_url_description")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("library_info_form_submitting") : t("library_info_form_submit")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}