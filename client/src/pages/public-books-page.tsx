import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { BookStatusBadge } from "@/components/ui/book-status-badge";
import { BookViewer3D } from "@/components/ui/book-viewer-3d";
import { Search } from "@/components/ui/search";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Book as BookIcon, Loader2, Filter } from "lucide-react";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PublicBooksPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [is3DViewerDialogOpen, setIs3DViewerDialogOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  // Fetch all genres
  const { data: genres } = useQuery<string[]>({
    queryKey: ['/api/genres'],
    queryFn: async () => {
      const res = await fetch('/api/genres');
      if (!res.ok) throw new Error('Failed to fetch genres');
      return res.json();
    }
  });

  // Fetch books
  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: searchQuery 
      ? ['/api/search', searchQuery, searchField] 
      : selectedGenre 
        ? ['/api/books/genre', selectedGenre] 
        : ['/api/books'],
    queryFn: async ({ queryKey }) => {
      if (searchQuery) {
        const url = `/api/search?query=${encodeURIComponent(searchQuery)}&field=${searchField}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to search books');
        return res.json();
      } else if (selectedGenre) {
        const res = await fetch(`/api/books/genre/${encodeURIComponent(selectedGenre)}`);
        if (!res.ok) throw new Error('Failed to fetch books by genre');
        return res.json();
      }
      
      const res = await fetch('/api/books');
      if (!res.ok) throw new Error('Failed to fetch books');
      return res.json();
    }
  });

  const handleSearch = (query: string, field: string) => {
    setSearchQuery(query);
    setSearchField(field);
    setSelectedGenre(null); // Reset genre filter when searching
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setSearchQuery(""); // Reset search when filtering by genre
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenre(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('books.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('books.browse_public')}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button>{t('auth.login')}</Button>
          </Link>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('books.filters')}</CardTitle>
          <CardDescription>{t('books.filter_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Search onSearch={handleSearch} />

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select
                value={selectedGenre || ""}
                onValueChange={handleGenreSelect}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('books.select_genre')} />
                </SelectTrigger>
                <SelectContent>
                  {genres?.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || selectedGenre) && (
              <Button variant="outline" onClick={clearFilters}>
                {t('books.clear_filters')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
                    <TableCell>
                      <span 
                        className="cursor-pointer text-primary hover:underline"
                        onClick={() => handleGenreSelect(book.genre)}
                      >
                        {book.genre}
                      </span>
                    </TableCell>
                    <TableCell>{book.year}</TableCell>
                    <TableCell>
                      <BookStatusBadge status={book.status as any} />
                    </TableCell>
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
              : selectedGenre
                ? t('books.empty.genre')
                : t('books.empty.library')}
          </p>
        </div>
      )}

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
    </div>
  );
}