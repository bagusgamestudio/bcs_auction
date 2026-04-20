import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export const SearchInput = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="relative w-96">
      <Input
        className="w-full bg-transparent text-xs"
        placeholder="Search..."
        onChange={(e) => {
          setSearchParams({ search: e.target.value });
        }}
        value={searchParams.get("search") || ""}
      />
      <SearchIcon className="absolute top-1/2 -translate-y-1/2 right-4 opacity-50" size={12} />
    </div>
  );
};
