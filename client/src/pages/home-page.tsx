import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
import Dashboard from "@/pages/dashboard";
import BooksPage from "@/pages/books-page";
import BorrowingPage from "@/pages/borrowing-page";
import UsersPage from "@/pages/users-page";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function HomePage() {
  const [location] = useLocation();
  const [searchVisible, setSearchVisible] = useState(false);
  
  const renderContent = () => {
    switch (location) {
      case "/":
        return <Dashboard />;
      case "/books":
        return <BooksPage />;
      case "/borrowing":
        return <BorrowingPage />;
      case "/users":
        return <UsersPage />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/books":
        return "Books";
      case "/borrowing":
        return "Borrowing";
      case "/users":
        return "Users";
      case "/reports":
        return "Reports";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header and Navigation */}
        <MobileNav />
        
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-semibold">{getPageTitle()}</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search books, authors, genres..."
                className="pl-10 pr-4 py-2"
              />
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
