import { cn } from "@/lib/utils";
import { 
  UserPlus, 
  BookmarkPlus, 
  BookmarkCheck, 
  PlusCircle, 
  Clock, 
  Edit, 
  Trash2
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

interface ActivityItemProps {
  type: string;
  username: string;
  bookTitle?: string;
  timestamp: Date;
  className?: string;
}

export function ActivityItem({ 
  type, 
  username, 
  bookTitle, 
  timestamp,
  className
}: ActivityItemProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_created":
        return (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <UserPlus className="h-4 w-4" />
          </div>
        );
      case "book_borrowed":
        return (
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0">
            <BookmarkPlus className="h-4 w-4" />
          </div>
        );
      case "book_returned":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
            <BookmarkCheck className="h-4 w-4" />
          </div>
        );
      case "book_added":
        return (
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 flex-shrink-0">
            <PlusCircle className="h-4 w-4" />
          </div>
        );
      case "book_updated":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
            <Edit className="h-4 w-4" />
          </div>
        );
      case "book_deleted":
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
            <Trash2 className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500 flex-shrink-0">
            <Clock className="h-4 w-4" />
          </div>
        );
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case "user_created":
        return (
          <p className="text-sm">
            <span className="font-medium">{username}</span> registered as a new reader
          </p>
        );
      case "book_borrowed":
        return (
          <p className="text-sm">
            <span className="font-medium">{username}</span> borrowed <span className="font-medium">{bookTitle}</span>
          </p>
        );
      case "book_returned":
        return (
          <p className="text-sm">
            <span className="font-medium">{username}</span> returned <span className="font-medium">{bookTitle}</span>
          </p>
        );
      case "book_added":
        return (
          <p className="text-sm">
            <span className="font-medium">{username}</span> added <span className="font-medium">{bookTitle}</span> to the collection
          </p>
        );
      case "book_updated":
        return (
          <p className="text-sm">
            <span className="font-medium">{username}</span> updated <span className="font-medium">{bookTitle}</span>
          </p>
        );
      case "book_deleted":
        return (
          <p className="text-sm">
            <span className="font-medium">{username}</span> removed <span className="font-medium">{bookTitle}</span> from the collection
          </p>
        );
      default:
        return (
          <p className="text-sm">
            <span className="font-medium">{username}</span> performed an action
          </p>
        );
    }
  };

  const formatTimestamp = (date: Date) => {
    if (isToday(date)) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, yyyy h:mm a");
    }
  };

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {getActivityIcon(type)}
      <div>
        {getActivityText(type)}
        <p className="text-xs text-slate-500 mt-1">{formatTimestamp(new Date(timestamp))}</p>
      </div>
    </div>
  );
}
