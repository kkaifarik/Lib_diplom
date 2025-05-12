import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";

interface SearchProps {
  onSearch: (query: string, field: string) => void;
  className?: string;
}

export function Search({ onSearch, className }: SearchProps) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, field);
  };

  return (
    <form onSubmit={handleSearch} className={className}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search books, authors, genres..."
          className="w-full pl-10 pr-4 py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </form>
  );
}
