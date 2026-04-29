import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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

const HomePage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("active");
  const [category, setCategory] = useState("vehicle");

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const data = await fetchNui<{ data: Auction[]; total: number }>(
        "getAuctions",
        {
          status,
          category,
          page: 1,
          limit: 4,
        },
        { data: [], total: 0 },
      );
      setAuctions(data.data || []);
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [status, category]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Auctions</h1>
        <Link to="/create">
          <Button>Create</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="coming_soon">Coming Soon</SelectItem>
            <SelectItem value="past">Past</SelectItem>
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
            <AuctionCard
              key={auction.id}
              auction={auction}
              onRefresh={fetchAuctions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
