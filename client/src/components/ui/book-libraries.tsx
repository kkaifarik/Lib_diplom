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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LibraryInfo, InsertBookLibrary } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Library } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const quantitySchema = z.object({
  libraryId: z.string().min(1, "Library is required"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
});

interface BookLibrariesProps {
  bookId: number;
}

type BookLibraryWithLibrary = {
  bookId: number;
  libraryId: number;
  quantity: number;
  library: LibraryInfo;
};

export function BookLibraries({ bookId }: BookLibrariesProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<BookLibraryWithLibrary | null>(null);

  const form = useForm<z.infer<typeof quantitySchema>>({
    resolver: zodResolver(quantitySchema),
    defaultValues: {
      libraryId: "",
      quantity: 1,
    },
  });

  const { data: bookLibraries = [], isLoading: isLoadingLibraries } = useQuery<BookLibraryWithLibrary[]>({
    queryKey: ["/api/books", bookId, "libraries"],
    queryFn: async () => {
      const response = await fetch(`/api/books/${bookId}/libraries`);
      if (!response.ok) {
        throw new Error("Failed to fetch book libraries");
      }
      return response.json();
    },
  });

  const { data: allLibraries = [], isLoading: isLoadingAllLibraries } = useQuery<LibraryInfo[]>({
    queryKey: ["/api/libraries"],
    queryFn: async () => {
      const response = await fetch("/api/libraries");
      if (!response.ok) {
        throw new Error("Failed to fetch libraries");
      }
      return response.json();
    },
  });

  // Filter out libraries that already have the book
  const availableLibraries = allLibraries.filter(
    (library) => !bookLibraries.some((bl) => bl.libraryId === library.id)
  );

  const addToLibraryMutation = useMutation({
    mutationFn: async (data: InsertBookLibrary) => {
      const response = await apiRequest("POST", "/api/book-libraries", data);
      if (!response.ok) {
        throw new Error("Failed to add book to library");
      }
      return response.json();
    },
    onSuccess: () => {
      setDialogOpen(false);
      form.reset({ libraryId: "", quantity: 1 });
      toast({
        title: t("success"),
        description: t("books.addedToLibrary"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "libraries"] });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ bookId, libraryId, quantity }: { bookId: number; libraryId: number; quantity: number }) => {
      const response = await apiRequest("PATCH", "/api/book-libraries", { bookId, libraryId, quantity });
      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }
      return response.json();
    },
    onSuccess: () => {
      setDialogOpen(false);
      setEditData(null);
      form.reset({ libraryId: "", quantity: 1 });
      toast({
        title: t("success"),
        description: t("books.quantityUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "libraries"] });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromLibraryMutation = useMutation({
    mutationFn: async ({ bookId, libraryId }: { bookId: number; libraryId: number }) => {
      const response = await apiRequest("DELETE", "/api/book-libraries", { bookId, libraryId });
      if (!response.ok) {
        throw new Error("Failed to remove book from library");
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: t("success"),
        description: t("books.removedFromLibrary"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books", bookId, "libraries"] });
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof quantitySchema>) => {
    if (editData) {
      updateQuantityMutation.mutate({
        bookId,
        libraryId: parseInt(values.libraryId),
        quantity: values.quantity,
      });
    } else {
      addToLibraryMutation.mutate({
        bookId,
        libraryId: parseInt(values.libraryId),
        quantity: values.quantity,
      });
    }
  };

  const handleAdd = () => {
    setEditData(null);
    form.reset({ libraryId: "", quantity: 1 });
    setDialogOpen(true);
  };

  const handleEdit = (bookLibrary: BookLibraryWithLibrary) => {
    setEditData(bookLibrary);
    form.reset({
      libraryId: String(bookLibrary.libraryId),
      quantity: bookLibrary.quantity,
    });
    setDialogOpen(true);
  };

  const handleRemove = (libraryId: number) => {
    if (window.confirm(t("books.confirmRemoveFromLibrary"))) {
      removeFromLibraryMutation.mutate({ bookId, libraryId });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("books.locationsTitle")}</h3>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {t("books.addToLibrary")}
        </Button>
      </div>

      {isLoadingLibraries ? (
        <div className="text-center py-4">{t("loading")}</div>
      ) : bookLibraries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Library className="h-10 w-10 mx-auto mb-2 text-primary/40" />
            <p>{t("books.notFoundInLibraries")}</p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("books.libraryName")}</TableHead>
              <TableHead>{t("books.address")}</TableHead>
              <TableHead className="text-right">{t("books.quantity")}</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookLibraries.map((bookLibrary) => (
              <TableRow key={bookLibrary.libraryId}>
                <TableCell className="font-medium">{bookLibrary.library.name}</TableCell>
                <TableCell>{bookLibrary.library.address}</TableCell>
                <TableCell className="text-right">{bookLibrary.quantity}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(bookLibrary)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(bookLibrary.libraryId)}
                      disabled={removeFromLibraryMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editData ? t("books.updateQuantity") : t("books.addToLibraryTitle")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="libraryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("books.selectLibrary")}</FormLabel>
                    <Select
                      disabled={!!editData}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("books.selectLibraryPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {editData ? (
                          <SelectItem value={String(editData.libraryId)}>
                            {editData.library.name}
                          </SelectItem>
                        ) : (
                          availableLibraries.map((library) => (
                            <SelectItem key={library.id} value={String(library.id)}>
                              {library.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("books.quantity")}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    addToLibraryMutation.isPending ||
                    updateQuantityMutation.isPending ||
                    (availableLibraries.length === 0 && !editData)
                  }
                >
                  {addToLibraryMutation.isPending || updateQuantityMutation.isPending
                    ? t("loading")
                    : t("save")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}