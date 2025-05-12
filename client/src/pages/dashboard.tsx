import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { StatCard } from "@/components/ui/stat-card";
import { ActivityItem } from "@/components/ui/activity-item";
import { BookStatusBadge } from "@/components/ui/book-status-badge";
import { Button } from "@/components/ui/button";
import { Loader2, Book, User, BookMarked, Clock, PlusCircle, Search, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Book as BookType, Borrow } from "@shared/schema";
import { LibraryInfo } from "@/components/ui/library-info";
import { useLanguage } from "@/hooks/use-language";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  
  // Fetch stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
    enabled: user?.role === 'librarian',
  });
  
  // Fetch books
  const { data: books, isLoading: isLoadingBooks } = useQuery<BookType[]>({
    queryKey: ['/api/books'],
  });

  // Fetch user's borrows (only for readers)
  const { data: borrows, isLoading: isLoadingBorrows } = useQuery<Borrow[]>({
    queryKey: ['/api/borrows'],
    enabled: user?.role === 'reader',
  });

  // Get book titles for borrowed books
  const borrowedBooks = books && borrows ? 
    borrows.map(borrow => {
      const book = books.find(b => b.id === borrow.bookId);
      return {
        ...borrow,
        bookTitle: book?.title || `Book #${borrow.bookId}`
      };
    }) : [];
    
  // Get only active borrows (not returned)
  const activeBorrows = borrowedBooks.filter(borrow => !borrow.returnDate);

  const isLoading = isLoadingStats || isLoadingBooks || isLoadingBorrows;

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <section className="bg-gradient-to-r from-primary to-cyan-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">{t('dashboard.welcome')}</h1>
        <p className="mb-4 max-w-2xl">
          {t('dashboard.subtitle')}
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          {user?.role === 'librarian' && (
            <Link href="/books">
              <Button className="bg-white text-primary hover:bg-slate-100">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>{t('dashboard.addBook')}</span>
              </Button>
            </Link>
          )}
          <Link href="/books">
            <Button variant="secondary" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
              <Search className="mr-2 h-4 w-4" />
              <span>{t('dashboard.search')}</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('dashboard.stats.totalBooks')}
            value={stats?.totalBooks || books?.length || 0}
            icon={<Book className="h-5 w-5" />}
            iconColor="primary"
          />
          
          {user?.role === 'librarian' ? (
            <>
              <StatCard
                title={t('dashboard.stats.activeReaders')}
                value={stats?.totalUsers || 0}
                icon={<User className="h-5 w-5" />}
                iconColor="secondary"
              />
              
              <StatCard
                title={t('dashboard.stats.booksBorrowed')}
                value={stats?.borrowedBooks || 0}
                icon={<BookMarked className="h-5 w-5" />}
                iconColor="accent"
              />
              
              <StatCard
                title={t('dashboard.stats.overdueBooks')}
                value={stats?.overdueBooks || 0}
                icon={<Clock className="h-5 w-5" />}
                iconColor="error"
              />
            </>
          ) : (
            <>
              <StatCard
                title={t('dashboard.stats.yourBorrows')}
                value={borrows?.length || 0}
                icon={<BookMarked className="h-5 w-5" />}
                iconColor="secondary"
              />
              
              <StatCard
                title={t('dashboard.stats.activeBorrows')}
                value={activeBorrows.length || 0}
                icon={<BookMarked className="h-5 w-5" />}
                iconColor="accent"
              />
              
              <StatCard
                title={t('dashboard.stats.returnsNeeded')}
                value={activeBorrows.filter(borrow => 
                  new Date(borrow.dueDate) < new Date()
                ).length || 0}
                icon={<Clock className="h-5 w-5" />}
                iconColor="error"
              />
            </>
          )}
        </div>
      )}
      
      {/* Reader's Active Borrows */}
      {user?.role === 'reader' && (
        <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">{t('dashboard.yourBooks')}</h3>
            <Link href="/borrowing" className="text-sm text-primary hover:underline flex items-center">
              {t('dashboard.viewAllBorrows')} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {isLoadingBorrows ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activeBorrows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('books.title')}</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('borrowing.borrowDate')}</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('borrowing.dueDate')}</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('books.status')}</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBorrows.slice(0, 3).map((borrow) => {
                    const isOverdue = new Date(borrow.dueDate) < new Date();
                    
                    return (
                      <tr key={borrow.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                              <Book className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{borrow.bookTitle}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{format(new Date(borrow.borrowDate), "PPP")}</td>
                        <td className="py-3 px-4 text-sm">{format(new Date(borrow.dueDate), "PPP")}</td>
                        <td className="py-3 px-4">
                          {isOverdue ? (
                            <BookStatusBadge status="borrowed" className="bg-red-500/10 text-red-500" />
                          ) : (
                            <BookStatusBadge status="borrowed" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate("/borrowing")}
                          >
                            {t('borrowing.returnBook')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {activeBorrows.length > 3 && (
                <div className="text-center py-3">
                  <Link href="/borrowing" className="text-sm text-primary hover:underline">
                    {t('dashboard.viewAllBorrows')}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t('dashboard.noBorrows')}
              <div className="mt-3">
                <Button onClick={() => navigate("/borrowing")}>
                  {t('dashboard.borrowBook')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Recently Added Books */}
      <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{t('dashboard.recentBooks')}</h3>
          <Link href="/books" className="text-sm text-primary hover:underline flex items-center">
            {t('dashboard.viewAll')} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {isLoadingBooks ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : books && books.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('books.title')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('books.author')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('books.genre')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('books.year')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('books.status')}</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {books.slice(0, 5).map((book) => (
                  <tr key={book.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                          <Book className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{book.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{book.author}</td>
                    <td className="py-3 px-4 text-sm">{book.genre}</td>
                    <td className="py-3 px-4 text-sm">{book.year}</td>
                    <td className="py-3 px-4">
                      <BookStatusBadge status={book.status as any} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/books")}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {t('dashboard.noBooks')}
          </div>
        )}
      </div>
      
      {/* Library Info Section */}
      <LibraryInfo />
      
      {user?.role === 'librarian' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Activity */}
          <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-medium mb-4">{t('dashboard.recentActivity')}</h3>
            
            {isLoadingStats ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <ActivityItem
                    key={index}
                    type={activity.type}
                    username={activity.username}
                    bookTitle={activity.bookTitle}
                    timestamp={new Date(activity.timestamp)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t('dashboard.noActivity')}
              </div>
            )}
          </div>
          
          {/* Borrowing Summary - Only real data */}
          <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{t('dashboard.borrowingSummary')}</h3>
              <Link href="/borrowing" className="text-sm text-primary hover:underline flex items-center">
                {t('dashboard.manageAllBorrows')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {isLoadingStats ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">{t('dashboard.stats.booksBorrowed')}</span>
                    <span className="font-medium">{stats?.borrowedBooks || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">{t('dashboard.stats.overdueBooks')}</span>
                    <span className="font-medium">{stats?.overdueBooks || 0}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">{t('dashboard.topBorrowedBooks')}</h4>
                  <div className="space-y-3">
                    {stats?.popularBooks && stats.popularBooks.length > 0 ? (
                      stats.popularBooks.map((book, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{book.title}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${Math.min(book.borrowCount * 10, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {book.borrowCount} {t('dashboard.borrows')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-2 text-muted-foreground">
                        {t('dashboard.noBorrowingData')}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
