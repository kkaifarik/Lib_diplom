import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Book, Borrow, InsertBorrow, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BookStatusBadge } from "@/components/ui/book-status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Book as BookIcon,
  Loader2,
  CheckCircle2,
  Calendar,
  Filter,
  User as UserIcon,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays, format } from "date-fns";
import { useLanguage } from "@/hooks/use-language";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const borrowFormSchema = z.object({
  bookId: z.string().min(1, "Please select a book"),
  dueDate: z.string().min(1, "Please select a due date"),
});

type BorrowFormValues = z.infer<typeof borrowFormSchema>;

type BorrowWithDetails = Borrow & {
  bookTitle?: string;
  userName?: string;
};

export default function BorrowingPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddBorrowDialogOpen, setIsAddBorrowDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("active");
  const isLibrarian = user?.role === "librarian";

  // Fetch borrows
  const { data: borrows, isLoading: isLoadingBorrows } = useQuery<Borrow[]>({
    queryKey: ['/api/borrows'],
  });

  // Fetch all books (for titles)
  const { data: books, isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });

  // Fetch available books (for borrowing)
  const { data: availableBooks, isLoading: isLoadingAvailableBooks } = useQuery<Book[]>({
    queryKey: ['/api/books'],
    select: (data) => data.filter(book => book.status === 'available'),
    enabled: isAddBorrowDialogOpen, // Only load when dialog is open
  });

  // Fetch users for librarians
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: isLibrarian,
  });

  // Create borrow mutation
  const createBorrowMutation = useMutation({
    mutationFn: async (data: InsertBorrow) => {
      const res = await apiRequest("POST", "/api/borrows", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/borrows'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: t("borrowing.successBorrow"),
        description: t("borrowing.successBorrowDescription"),
      });
      setIsAddBorrowDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: t("borrowing.failedBorrow"),
        description: error.message || t("errors.unknown"),
        variant: "destructive",
      });
    },
  });

  // Return book mutation
  const returnBookMutation = useMutation({
    mutationFn: async (borrowId: number) => {
      const res = await apiRequest("PUT", `/api/borrows/${borrowId}/return`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/borrows'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: t("borrowing.successReturn"),
        description: t("borrowing.successReturnDescription"),
      });
    },
    onError: (error) => {
      toast({
        title: t("borrowing.failedReturn"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<BorrowFormValues>({
    resolver: zodResolver(borrowFormSchema),
    defaultValues: {
      bookId: "",
      dueDate: format(addDays(new Date(), 14), "yyyy-MM-dd"), // Default 2 weeks
    },
  });

  const handleBorrowSubmit = (values: BorrowFormValues) => {
    const borrowData: InsertBorrow = {
      bookId: parseInt(values.bookId),
      userId: user!.id,
      borrowDate: new Date().toISOString(),
      dueDate: new Date(values.dueDate).toISOString(),
    };
    
    createBorrowMutation.mutate(borrowData);
  };

  const handleReturnBook = (borrowId: number) => {
    returnBookMutation.mutate(borrowId);
  };

  const isLoading = isLoadingBorrows || isLoadingBooks || (isLibrarian && isLoadingUsers);

  // Generate selectable due dates (today + 1 week, 2 weeks, 1 month)
  const dueDateOptions = [
    { value: format(addDays(new Date(), 7), "yyyy-MM-dd"), label: t("borrowing.oneWeek") },
    { value: format(addDays(new Date(), 14), "yyyy-MM-dd"), label: t("borrowing.twoWeeks") },
    { value: format(addDays(new Date(), 30), "yyyy-MM-dd"), label: t("borrowing.oneMonth") },
  ];

  // Process borrow data to include book titles and user names
  const borrowsWithDetails: BorrowWithDetails[] = !isLoading && borrows && books ? 
    borrows.map(borrow => {
      const book = books.find(b => b.id === borrow.bookId);
      const borrowUser = users?.find(u => u.id === borrow.userId);
      return {
        ...borrow,
        bookTitle: book?.title || `Book #${borrow.bookId}`,
        userName: borrowUser?.name || `User #${borrow.userId}`
      };
    }) : [];

  // Filter borrows based on active tab
  const filteredBorrows = borrowsWithDetails.filter(borrow => {
    switch (activeTab) {
      case "active":
        return !borrow.returnDate;
      case "returned":
        return !!borrow.returnDate;
      case "overdue":
        return !borrow.returnDate && new Date(borrow.dueDate) < new Date();
      default:
        return true;
    }
  });

  // Get counts for tabs
  const activeBorrowsCount = borrowsWithDetails.filter(b => !b.returnDate).length;
  const returnedBorrowsCount = borrowsWithDetails.filter(b => !!b.returnDate).length;
  const overdueBorrowsCount = borrowsWithDetails.filter(b => !b.returnDate && new Date(b.dueDate) < new Date()).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("borrowing.title")}</h1>
        <Button 
          onClick={() => setIsAddBorrowDialogOpen(true)}
          disabled={!availableBooks || availableBooks.length === 0}
        >
          {t("borrowing.borrowButton")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : borrowsWithDetails.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t("borrowing.borrowingList")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="active" className="relative">
                  {t("borrowing.active")}
                  {activeBorrowsCount > 0 && (
                    <Badge className="ml-2 bg-primary">{activeBorrowsCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="returned">
                  {t("borrowing.returned")}
                  {returnedBorrowsCount > 0 && (
                    <Badge className="ml-2 bg-green-600">{returnedBorrowsCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="overdue">
                  {t("borrowing.overdue")}
                  {overdueBorrowsCount > 0 && (
                    <Badge className="ml-2 bg-red-500">{overdueBorrowsCount}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="m-0">
                <BorrowTable 
                  borrows={filteredBorrows} 
                  showUserColumn={isLibrarian}
                  onReturnBook={handleReturnBook}
                  returnMutationPending={returnBookMutation.isPending}
                  t={t}
                />
              </TabsContent>
              
              <TabsContent value="returned" className="m-0">
                <BorrowTable 
                  borrows={filteredBorrows} 
                  showUserColumn={isLibrarian}
                  onReturnBook={handleReturnBook}
                  returnMutationPending={returnBookMutation.isPending}
                  t={t}
                />
              </TabsContent>
              
              <TabsContent value="overdue" className="m-0">
                <BorrowTable 
                  borrows={filteredBorrows} 
                  showUserColumn={isLibrarian}
                  onReturnBook={handleReturnBook}
                  returnMutationPending={returnBookMutation.isPending}
                  t={t}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <BookIcon className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium">{t("borrowing.noBorrows")}</h3>
          <p className="mt-2 text-sm text-slate-500">
            {t("borrowing.noBorrowsDescription")}
          </p>
          <Button
            className="mt-4"
            onClick={() => setIsAddBorrowDialogOpen(true)}
            disabled={!books || books.filter(b => b.status === 'available').length === 0}
          >
            {t("borrowing.borrowButton")}
          </Button>
        </div>
      )}

      {/* Borrow Book Dialog */}
      <Dialog open={isAddBorrowDialogOpen} onOpenChange={setIsAddBorrowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("borrowing.borrowDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("borrowing.borrowDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleBorrowSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="bookId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("books.book")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("borrowing.selectBook")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableBooks && availableBooks.length > 0 ? (
                          availableBooks.map((book) => (
                            <SelectItem key={book.id} value={book.id.toString()}>
                              {book.title} ({book.author})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            {t("borrowing.noAvailableBooks")}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("borrowing.dueDate")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("borrowing.selectDueDate")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dueDateOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} ({option.value})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={createBorrowMutation.isPending}
              >
                {createBorrowMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("loading")}
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    {t("borrowing.confirmBorrow")}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Table component to display borrows
function BorrowTable({ 
  borrows, 
  showUserColumn, 
  onReturnBook,
  returnMutationPending,
  t
}: { 
  borrows: BorrowWithDetails[],
  showUserColumn: boolean,
  onReturnBook: (id: number) => void,
  returnMutationPending: boolean,
  t: (key: string) => string
}) {
  if (borrows.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        {t("borrowing.noRecordsInFilter")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("books.title")}</TableHead>
            {showUserColumn && <TableHead>{t("borrowing.borrower")}</TableHead>}
            <TableHead>{t("borrowing.borrowDate")}</TableHead>
            <TableHead>{t("borrowing.dueDate")}</TableHead>
            <TableHead>{t("books.status")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {borrows.map((borrow) => {
            const isReturned = !!borrow.returnDate;
            const isOverdue = !isReturned && new Date(borrow.dueDate) < new Date();
            
            return (
              <TableRow key={borrow.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-12 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-500">
                      <BookIcon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{borrow.bookTitle}</span>
                  </div>
                </TableCell>
                {showUserColumn && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      <span>{borrow.userName}</span>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  {format(new Date(borrow.borrowDate), "PPP")}
                </TableCell>
                <TableCell>
                  {format(new Date(borrow.dueDate), "PPP")}
                </TableCell>
                <TableCell>
                  {isReturned ? (
                    <BookStatusBadge status="available" />
                  ) : isOverdue ? (
                    <BookStatusBadge status="borrowed" className="bg-red-500/10 text-red-500" />
                  ) : (
                    <BookStatusBadge status="borrowed" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!isReturned && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReturnBook(borrow.id)}
                      disabled={returnMutationPending}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t("borrowing.returnBook")}
                    </Button>
                  )}
                  {isReturned && (
                    <span className="text-sm text-slate-500">
                      {t("borrowing.returnedOn")} {format(new Date(borrow.returnDate!), "PPP")}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
