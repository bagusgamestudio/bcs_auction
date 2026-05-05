import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { generatePagination } from "@/utils/misc";
import { useSearchParams } from "react-router-dom";

export const PaginationComponent = ({ totalPages }: { totalPages: number }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams?.get("page")) || 1;
  const allPages = generatePagination(currentPage, totalPages);

  const changePage = (page: number) => {
    if (!page || page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  return (
    <Pagination className="mt-6">
      <PaginationContent className="gap-1">
        <PaginationItem>
          <PaginationPrevious 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              changePage(currentPage - 1);
            }}
            className={cn(
              "bg-slate-800/50 border border-cyan-500/30 hover:bg-slate-700 hover:border-cyan-500/50 text-white",
              (currentPage <= 1) && "opacity-50 pointer-events-none"
            )}
          />
        </PaginationItem>
        {allPages.map((page, index) => {
          if (page === "...") {
            return (
              <PaginationItem key={index}>
                <span className="px-2 text-slate-500">...</span>
              </PaginationItem>
            );
          }

          const pageNum = page as number;
          return (
            <PaginationItem key={index}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  changePage(pageNum);
                }}
                className={cn(
                  "rounded-lg border transition-colors",
                  pageNum === currentPage
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                    : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-cyan-400"
                )}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              changePage(currentPage + 1);
            }}
            className={cn(
              "bg-slate-800/50 border border-cyan-500/30 hover:bg-slate-700 hover:border-cyan-500/50 text-white",
              (currentPage >= totalPages) && "opacity-50 pointer-events-none"
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
