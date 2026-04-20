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
import { useLocation, useSearchParams } from "react-router-dom";

export const PaginationComponent = ({ totalPages }: { totalPages: number }) => {
  const { pathname } = useLocation();
  const [searchParams, _] = useSearchParams();
  const currentPage = Number(searchParams?.get("page")) || 1;
  const allPages = generatePagination(currentPage, totalPages);

  const changePage = (page: number) => {
    if (!page || page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `#${pathname}?${params.toString()}`;
  };

  return (
    <Pagination className="mt-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={changePage(currentPage - 1)} />
        </PaginationItem>
        {allPages.map((page, index) => {
          if (page === "...") {
            const prevPage = allPages[index - 1] as number;
            const nextPage = allPages[index + 1] as number;

            const targetPage =
              nextPage < currentPage ? nextPage - 1 : prevPage + 1;

            return (
              <PaginationItem key={index}>
                <PaginationLink
                  href={changePage(targetPage)}
                  className="opacity-80"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={index}>
              <PaginationLink
                href={changePage(page as number)}
                className={cn(currentPage !== page && "opacity-80")}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext href={changePage(currentPage + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
