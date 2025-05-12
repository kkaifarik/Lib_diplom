import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor?: 
    | "primary" 
    | "secondary" 
    | "accent" 
    | "error";
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  iconColor = "primary",
  trend,
  className,
}: StatCardProps) {
  const getColorClass = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary/10 text-primary";
      case "secondary":
        return "bg-cyan-500/10 text-cyan-500";
      case "accent":
        return "bg-orange-500/10 text-orange-500";
      case "error":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getTrendColorClass = (value: number) => {
    return value >= 0 ? "text-emerald-500" : "text-red-500";
  };

  const TrendIcon = trend?.value && trend.value >= 0 ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className={cn("bg-white p-4 rounded-xl border border-slate-200 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={cn("p-2 rounded-lg", getColorClass(iconColor))}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs">
          <span className={cn("flex items-center", getTrendColorClass(trend.value))}>
            <TrendIcon className="mr-1 h-3 w-3" />
            {Math.abs(trend.value)}%
          </span>
          <span className="text-slate-500 ml-2">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
