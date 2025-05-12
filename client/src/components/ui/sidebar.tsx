import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  LayoutDashboard,
  BookMarked,
  Users,
  BarChart,
  LogOut,
  Book,
  Library,
  User,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Sidebar({ className }: { className?: string }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { t } = useLanguage();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    {
      href: "/dashboard",
      label: t('nav.dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
      active: isActive("/dashboard"),
    },
    {
      href: "/books",
      label: t('nav.books'),
      icon: <Book className="w-5 h-5" />,
      active: isActive("/books"),
    },
    {
      href: "/libraries",
      label: t('libraries.title'),
      icon: <Library className="w-5 h-5" />,
      active: isActive("/libraries"),
    },
    {
      href: "/borrowing",
      label: t('nav.borrowing'),
      icon: <BookMarked className="w-5 h-5" />,
      active: isActive("/borrowing"),
    },
  ];

  // Common profile route
  const profileItem = {
    href: "/profile",
    label: t('profile.title'),
    icon: <User className="w-5 h-5" />,
    active: isActive("/profile"),
  };
  
  // Add librarian-only routes
  const librarianNavItems = [
    {
      href: "/users",
      label: t('nav.users'),
      icon: <Users className="w-5 h-5" />,
      active: isActive("/users"),
    },
    {
      href: "/reports",
      label: t('dashboard.stats.title'),
      icon: <BarChart className="w-5 h-5" />,
      active: isActive("/reports"),
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col w-64 bg-background border-r border-border p-4",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-8">
        <BookOpen className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-semibold">МояБиблиотека</h1>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 mb-8 p-3 bg-muted rounded-lg">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {user?.name?.charAt(0) || "U"}
        </div>
        <div>
          <p className="font-medium text-sm">{user?.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {user?.role === "librarian" ? t('auth.role.librarian') : t('auth.role.reader')}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm rounded-md font-medium",
              item.active
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}

        {user?.role === "librarian" &&
          librarianNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md font-medium",
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}

        {/* Profile link */}
        <Link
          href={profileItem.href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm rounded-md font-medium",
            profileItem.active
              ? "bg-primary/10 text-primary"
              : "text-foreground hover:bg-muted"
          )}
        >
          {profileItem.icon}
          <span>{profileItem.label}</span>
        </Link>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md font-medium text-foreground hover:bg-muted"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
