import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchNui } from "@/utils/fetchNui";
import { Auction } from "@/types";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/hooks/usePlayer";
import LiveView from "./live";
import { useNuiEvent } from "@/hooks/useNuiEvent";
import { parseDate } from "@/utils/date";
import OnGoingView from "./ongoing";
import { Gavel, ArrowLeft, Clock, Timer, Car, Home, Package, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const { player } = usePlayer();

  useEffect(() => {
    const fetchAuction = async () => {
      if (!id) return;
      try {
        const data = await fetchNui<Auction>("getAuctionById", {
          id: Number(id),
        });
        setAuction(data || null);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

  useNuiEvent<{
    id: number;
    key: keyof Auction;
    value: Auction[keyof Auction];
  }>("updateAuction", (data) => {
    setAuction((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [data.key]: data.value,
      };
    });
  });

  if (loading) return (
    <div className="p-8 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent">
      </div>
      <p className="mt-4 text-slate-400">Loading auction...</p>
    </div>
  );

  if (!auction) return (
    <div className="p-8 text-center">
      <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <p className="text-slate-400">Auction not found</p>
    </div>
  );

  if (auction.finished_at) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-cyan-400"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Auctions
          </Button>
        </div>
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Gavel className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-300 mb-2">Auction Finished</h2>
          <p className="text-slate-400">This auction has ended</p>
        </div>
      </div>
    );
  }

  if (auction.type === "live" && auction.live)
    return <LiveView data={auction} />;

  const date = new Date();
  const startTime = parseDate(auction.start_time);
  const endTime = parseDate(auction.end_time);

  if (startTime && endTime) {
    if (startTime <= date && endTime >= date) {
      return <OnGoingView data={auction} />;
    }
  }

  const getCategoryInfo = () => {
    if (auction.category === "vehicle") {
      return {
        label: auction.category_data?.vehiclePlate || "Vehicle",
        icon: <Car className="w-16 h-16 text-cyan-400/20" />
      };
    }
    if (auction.category === "property") {
      return {
        label: auction.category_data?.homeName || "Property",
        icon: <Home className="w-16 h-16 text-cyan-400/20" />
      };
    }
    return {
      label: auction.category_data?.itemLabel || auction.category_data?.itemName || "Item",
      icon: <Package className="w-16 h-16 text-cyan-400/20" />
    };
  };

  const info = getCategoryInfo();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-cyan-400"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Auctions
        </Button>
        {auction.type === "live" &&
          auction.identifier == player?.identifier && (
            <Button
              onClick={() => {
                fetchNui("startLive", auction.id);
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
            >
              <Timer className="w-4 h-4 mr-2" />
              Start Live Auction
            </Button>
          )}
      </div>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex items-center justify-center">{info.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-cyan-50">{info.label}</h1>
              <Badge className="bg-blue-500/20 text-cyan-400 border-cyan-500/30 capitalize">
                {auction.type}
              </Badge>
              <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 capitalize">
                {auction.category}
              </Badge>
            </div>
            <p className="text-sm text-slate-400 capitalize">{auction.category} Auction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Starting Price</p>
            <p className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              ${auction.starting_price.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Minimum Bid</p>
            <p className="text-xl font-semibold text-cyan-100">
              ${auction.minimum_bid.toLocaleString()}
            </p>
          </div>
          {auction.buyout_price > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-amber-500/20">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Gavel className="w-3 h-3" />
                Buyout Price
              </p>
              <p className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                ${auction.buyout_price.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {(auction.start_time || auction.end_time) && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700/50 text-sm">
            {auction.start_time && (
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Starts: {parseDate(auction.start_time)?.toLocaleString()}</span>
              </div>
            )}
            {auction.end_time && (
              <div className="flex items-center gap-2 text-cyan-400">
                <Timer className="w-4 h-4" />
                <span>Ends: {parseDate(auction.end_time)?.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPage;
