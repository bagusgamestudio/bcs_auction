import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchNui } from "@/utils/fetchNui";
import { Auction } from "@/types";
import { AuctionCard } from "./components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, Plus } from "lucide-react";
import { PaginationComponent } from "@/components/pagination";

const HomePage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") || 1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const data = await fetchNui<{ data: Auction[]; total: number }>(
        "getAuctions",
        {
          status,
          category,
          page: currentPage,
          limit: 4,
        },
        { data: [], total: 0 },
      );
      setAuctions(data.data || []);
      setTotalPages(Math.ceil(data.total / 4));
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [status, category, currentPage]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-6 h-6 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Auctions
            </h1>
            <p className="text-xs text-slate-400">
              Browse and bid on exclusive items
            </p>
          </div>
        </div>
        <Link to="/create">
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-0 shadow-[0_0_20px_rgba(0,200,255,0.3)]">
            <Plus className="w-4 h-4 mr-2" />
            Create Auction
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setSearchParams({ page: "1" });
          }}
        >
          <SelectTrigger className="w-[160px] bg-slate-800/50 border-cyan-500/30 hover:border-cyan-400/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-cyan-500/30">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="coming_soon">Coming Soon</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value);
            setSearchParams({ page: "1" });
          }}
        >
          <SelectTrigger className="w-[160px] bg-slate-800/50 border-cyan-500/30 hover:border-cyan-400/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-cyan-500/30">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="vehicle">Vehicle</SelectItem>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="item">Item</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent" />
          <p className="mt-4 text-slate-400">Loading auctions...</p>
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No auctions found</p>
          <p className="text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {auctions.map((auction) => (
              <div key={auction.id} className="h-full">
                <AuctionCard auction={auction} onRefresh={fetchAuctions} />
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <PaginationComponent totalPages={totalPages} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
