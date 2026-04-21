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
import { PaginationComponent } from "@/components/pagination";

const HomePage = () => {
  const [searchParams, _] = useSearchParams();

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [auctionType, setAuctionType] = useState("live");
  const [category, setCategory] = useState("vehicle");
  const [totalPages, setTotalPages] = useState(1);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const data = await fetchNui<{ data: Auction[]; total: number }>(
        "getAuctions",
        {
          auctionType,
          category,
          page: Number(searchParams.get("page")) || 1,
          limit: 4,
        },
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
  }, [auctionType, category, searchParams.get("page")]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Auctions</h1>
        <Link to="/create">
          <Button>Create</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <Select value={auctionType} onValueChange={setAuctionType}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vehicle">Vehicle</SelectItem>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="item">Item</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No auctions found
        </div>
      ) : (
        <div className="grid gap-3">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
      <PaginationComponent totalPages={totalPages} />
    </div>
  );
};

export default HomePage;
