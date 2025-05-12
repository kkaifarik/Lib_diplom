import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Book, InsertBook } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { BookForm } from "@/components/ui/book-form";
import { BookStatusBadge } from "@/components/ui/book-status-badge";
import { BookViewer3D } from "@/components/ui/book-viewer-3d";
import { BookLibraries } from "@/components/ui/book-libraries";
import { Search } from "@/components/ui/search";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Box as CubeIcon,
  Library,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function BooksPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  
  // State for dialogs
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const [isEditBookDialogOpen, setIsEditBookDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [is3DViewerDialogOpen, setIs3DViewerDialogOpen] = useState(false);
  const [isLibrariesDialogOpen, setIsLibrariesDialogOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  // Fetch books
  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: searchQuery ? ['/api/search', searchQuery, searchField] : ['/api/books'],
    queryFn: async ({ queryKey }) => {
      if (searchQuery) {
        const url = `/api/search?query=${encodeURIComponent(searchQuery)}&field=${searchField}`;
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to search books');
        return res.json();
      }
      
      const res = await fetch('/api/books', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch books');
      return res.json();
    }
  });

  // Add book mutation
  const addBookMutation = useMutation({
    mutationFn: async (newBook: InsertBook) => {
      const res = await apiRequest("POST", "/api/books", newBook);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: t('notification.book.added'),
        description: t('books.toast.added'),
      });
      setIsAddBookDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('books.toast.add_error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit book mutation
  const editBookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertBook }) => {
      const res = await apiRequest("PUT", `/api/books/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: t('notification.book.updated'),
        description: t('books.toast.updated'),
      });
      setIsEditBookDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('books.toast.update_error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: t('notification.book.deleted'),
        description: t('books.toast.deleted'),
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('books.toast.delete_error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddBook = (data: InsertBook) => {
    addBookMutation.mutate(data);
  };

  const handleEditBook = (data: InsertBook) => {
    if (currentBook) {
      editBookMutation.mutate({ id: currentBook.id, data });
    }
  };

  const handleDeleteBook = () => {
    if (currentBook) {
      deleteBookMutation.mutate(currentBook.id);
    }
  };

  const handleSearch = (query: string, field: string) => {
    setSearchQuery(query);
    setSearchField(field);
  };

  const isLibrarian = user?.role === 'librarian';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('books.title')}</h1>
        <div className="flex items-center gap-2">
          <Search onSearch={handleSearch} />
          {isLibrarian && (
            <Button onClick={() => setIsAddBookDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> {t('books.add')}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : books && books.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('books.table.title')}</TableHead>
                  <TableHead>{t('books.table.author')}</TableHead>
                  <TableHead>{t('books.table.genre')}</TableHead>
                  <TableHead>{t('books.table.year')}</TableHead>
                  <TableHead>{t('books.table.status')}</TableHead>
                  {isLibrarian && <TableHead className="text-right">{t('books.table.actions')}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-12 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-500 cursor-pointer hover:bg-slate-300 transition-colors"
                          onClick={() => {
                            setCurrentBook(book);
                            setIs3DViewerDialogOpen(true);
                          }}
                          title={t('book_viewer.view')}
                        >
                          <BookIcon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{book.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.genre}</TableCell>
                    <TableCell>{book.year}</TableCell>
                    <TableCell>
                      <BookStatusBadge status={book.status as any} />
                    </TableCell>
                    {isLibrarian && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentBook(book);
                                setIsEditBookDialogOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              {t('books.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentBook(book);
                                setIsLibrariesDialogOpen(true);
                              }}
                            >
                              <Library className="mr-2 h-4 w-4" />
                              {t('books.manageLibraries')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentBook(book);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('books.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <BookIcon className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium">{t('books.empty.title')}</h3>
          <p className="mt-2 text-sm text-slate-500">
            {searchQuery
              ? t('books.empty.search')
              : t('books.empty.library')}
          </p>
          {isLibrarian && !searchQuery && (
            <Button
              className="mt-4"
              onClick={() => setIsAddBookDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> {t('books.add_first')}
            </Button>
          )}
        </div>
      )}

      {/* Add Book Dialog */}
      <Dialog open={isAddBookDialogOpen} onOpenChange={setIsAddBookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('books.form.title')}</DialogTitle>
            <DialogDescription>
              {t('books.form.description')}
            </DialogDescription>
          </DialogHeader>
          <BookForm
            onSubmit={handleAddBook}
            isLoading={addBookMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={isEditBookDialogOpen} onOpenChange={setIsEditBookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('books.edit')}</DialogTitle>
            <DialogDescription>
              {t('books.form.edit_description')}
            </DialogDescription>
          </DialogHeader>
          {currentBook && (
            <BookForm
              book={currentBook}
              onSubmit={handleEditBook}
              isLoading={editBookMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('books.delete.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('books.delete.message')}{" "}
              <span className="font-medium">{currentBook?.title}</span> {t('books.delete.from_library')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('books.form.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBook}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteBookMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('books.delete.in_progress')}
                </>
              ) : (
                t('books.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 3D Book Viewer Dialog */}
      <Dialog open={is3DViewerDialogOpen} onOpenChange={setIs3DViewerDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{t('book_viewer.title')}</DialogTitle>
            <DialogDescription>
              {t('book_viewer.rotate_instruction')}
            </DialogDescription>
          </DialogHeader>
          {currentBook && (
            <BookViewer3D 
              bookTitle={currentBook.title} 
              className="mt-2" 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Book Libraries Dialog */}
      <Dialog open={isLibrariesDialogOpen} onOpenChange={setIsLibrariesDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t('books.librariesTitle')}</DialogTitle>
            <DialogDescription>
              {currentBook?.title} - {t('books.librariesDescription')}
            </DialogDescription>
          </DialogHeader>
          {currentBook && <BookLibraries bookId={currentBook.id} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
