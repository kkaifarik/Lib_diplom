import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { LibraryInfo, insertLibraryInfoSchema } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const formSchema = insertLibraryInfoSchema.extend({
  address: z.string().min(5, { message: "Address is required" }),
  phone: z.string().min(5, { message: "Phone is required" }),
  name: z.string().min(3, { message: "Name is required" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LibrariesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isLibrarian = user?.role === "librarian";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editLibrary, setEditLibrary] = useState<LibraryInfo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      openHours: "",
      description: null,
      logoUrl: null,
    },
  });

  useEffect(() => {
    if (editLibrary) {
      form.reset({
        name: editLibrary.name,
        address: editLibrary.address,
        phone: editLibrary.phone,
        email: editLibrary.email || "",
        openHours: editLibrary.openHours || "",
        description: editLibrary.description,
        logoUrl: editLibrary.logoUrl,
      });
    } else {
      form.reset({
        name: "",
        address: "",
        phone: "",
        email: "",
        openHours: "",
        description: null,
        logoUrl: null,
      });
    }
  }, [editLibrary, form]);

  const { data: libraries = [], isLoading } = useQuery<LibraryInfo[]>({
    queryKey: ["/api/libraries"],
  });

  const createLibraryMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/libraries", data);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || t("errors.unknown"));
      }
      return response.json();
    },
    onSuccess: () => {
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/libraries"] });
      toast({
        title: t("success"),
        description: t("libraries.created"),
      });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLibraryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormValues }) => {
      const response = await apiRequest("PATCH", `/api/libraries/${id}`, data);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || t("errors.unknown"));
      }
      return response.json();
    },
    onSuccess: () => {
      setDialogOpen(false);
      setEditLibrary(null);
      queryClient.invalidateQueries({ queryKey: ["/api/libraries"] });
      toast({
        title: t("success"),
        description: t("libraries.updated"),
      });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLibraryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/libraries/${id}`);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || t("errors.unknown"));
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/libraries"] });
      toast({
        title: t("success"),
        description: t("libraries.deleted"),
      });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (editLibrary) {
      updateLibraryMutation.mutate({ id: editLibrary.id, data: values });
    } else {
      createLibraryMutation.mutate(values);
    }
  };

  const openAddDialog = () => {
    setEditLibrary(null);
    setDialogOpen(true);
  };

  const openEditDialog = (library: LibraryInfo) => {
    setEditLibrary(library);
    setDialogOpen(true);
  };

  if (!user) return null;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("libraries.title")}</h1>
        {isLibrarian && (
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> {t("libraries.add")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">{t("loading")}</div>
      ) : libraries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("libraries.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {libraries.map((library) => (
            <Card key={library.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{library.name}</CardTitle>
                    <CardDescription>{library.address}</CardDescription>
                  </div>
                  {isLibrarian && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(library)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteLibraryMutation.mutate(library.id)}
                        disabled={deleteLibraryMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <h4 className="text-sm font-medium">{t("libraries.phone")}</h4>
                      <p className="text-sm">{library.phone}</p>
                    </div>
                    {library.email && (
                      <div>
                        <h4 className="text-sm font-medium">{t("libraries.email")}</h4>
                        <p className="text-sm">{library.email}</p>
                      </div>
                    )}
                    {library.openHours && (
                      <div>
                        <h4 className="text-sm font-medium">{t("libraries.openHours")}</h4>
                        <p className="text-sm">{library.openHours}</p>
                      </div>
                    )}
                  </div>
                  {library.description && (
                    <div>
                      <h4 className="text-sm font-medium">{t("libraries.description")}</h4>
                      <p className="text-sm text-muted-foreground">{library.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editLibrary ? t("libraries.edit") : t("libraries.add")}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("libraries.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>{t("libraries.address")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <FormLabel>{t("libraries.phone")}</FormLabel>
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
                      <FormLabel>{t("libraries.email")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                    <FormLabel>{t("libraries.openHours")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>{t("libraries.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    createLibraryMutation.isPending || updateLibraryMutation.isPending
                  }
                >
                  {createLibraryMutation.isPending || updateLibraryMutation.isPending
                    ? t("loading")
                    : editLibrary
                    ? t("save")
                    : t("create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}