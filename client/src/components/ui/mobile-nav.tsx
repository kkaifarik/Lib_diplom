import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { BookOpen, Menu, Search, Book, LayoutDashboard, BookMarked, Users, Library, ChevronLeft, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sidebar } from "./sidebar";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function MobileNav({ className }: { className?: string }) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Determine if we're on a subpage or nested page
  const isRootPage = ['/', '/books', '/libraries', '/borrowing', '/users', '/reports'].includes(location);

  const getCurrentPageTitle = () => {
    switch (location) {
      case "/":
        return t('nav.dashboard');
      case "/books":
        return t('nav.books');
      case "/libraries":
        return t('libraries.title');
      case "/borrowing":
        return t('nav.borrowing');
      case "/users":
        return t('nav.users');
      case "/reports":
        return t('dashboard.stats.title');
      default:
        return "МояБиблиотека";
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className={cn("lg:hidden flex flex-col border-b border-border bg-background sticky top-0 z-20", className)}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            {!isRootPage ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.history.back()}
                aria-label={t('nav.back')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <Sidebar className="w-full" />
                </SheetContent>
              </Sheet>
            )}
            <h1 className="text-lg font-semibold">{getCurrentPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-2">
            {!showSearch && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSearch(true)}
                aria-label={t('books.search')}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
            {showSearch && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSearch(false)}
                aria-label={t('common.close')}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="p-4 border-t border-border">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder={t('books.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary"
              >
                {t('books.searchButton')}
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Navigation - Only visible on root pages */}
      {isRootPage && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around p-2 z-10">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center py-1 px-3",
              location === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs mt-1">{t('nav.dashboard')}</span>
          </Link>
          
          <Link
            href="/books"
            className={cn(
              "flex flex-col items-center py-1 px-3",
              location === "/books" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Book className="h-5 w-5" />
            <span className="text-xs mt-1">{t('nav.books')}</span>
          </Link>
          
          <Link
            href="/libraries"
            className={cn(
              "flex flex-col items-center py-1 px-3",
              location === "/libraries" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Library className="h-5 w-5" />
            <span className="text-xs mt-1">{t('libraries.title')}</span>
          </Link>
          
          <Link
            href="/borrowing"
            className={cn(
              "flex flex-col items-center py-1 px-3",
              location === "/borrowing" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <BookMarked className="h-5 w-5" />
            <span className="text-xs mt-1">{t('nav.borrowing')}</span>
          </Link>
          
          {user?.role === "librarian" && (
            <Link
              href="/users"
              className={cn(
                "flex flex-col items-center py-1 px-3",
                location === "/users" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">{t('nav.users')}</span>
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

