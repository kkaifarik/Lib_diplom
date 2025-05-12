import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type BookStatus = "available" | "borrowed" | "reserved";

interface BookStatusBadgeProps {
  status: BookStatus;
  className?: string;
}

export function BookStatusBadge({ status, className }: BookStatusBadgeProps) {
  const getStatusClasses = (status: BookStatus) => {
    switch (status) {
      case "available":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "borrowed":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      case "reserved":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20";
    }
  };

  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-normal",
        getStatusClasses(status),
        className
      )}
    >
      {statusText}
    </Badge>
  );
}
