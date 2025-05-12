import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useLanguage } from "@/hooks/use-language";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Layout component with sidebar and navigation
export function AppLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const { t } = useLanguage();
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header and Navigation */}
        <MobileNav />
        
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between p-4 border-b border-border bg-background">
          <h2 className="text-xl font-semibold">{title}</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("books.search")}
                className="pl-10 pr-4 py-2"
              />
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
}: {
  path: string;
  component: React.ComponentType;
  requiredRole?: "librarian" | "reader";
}) {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">{t("common.accessDenied")}</h1>
          <p className="mb-6 text-muted-foreground text-center">
            {t("common.accessDeniedMessage")} {requiredRole}s.
          </p>
          <a href="/" className="text-primary hover:underline">
            {t("common.backToDashboard")}
          </a>
        </div>
      </Route>
    );
  }

  // Determine the page title based on the path
  let pageTitle = "";
  switch (path) {
    case "/":
      pageTitle = t("nav.dashboard");
      break;
    case "/books":
      pageTitle = t("nav.books");
      break;
    case "/borrowing":
      pageTitle = t("nav.borrowing");
      break;
    case "/libraries":
      pageTitle = t("nav.libraries");
      break;
    case "/users":
      pageTitle = t("nav.users");
      break;
    default:
      pageTitle = t("nav.dashboard");
  }

  return (
    <Route path={path}>
      <AppLayout title={pageTitle}>
        <Component />
      </AppLayout>
    </Route>
  );
}
