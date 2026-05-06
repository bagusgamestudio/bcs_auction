import { useState } from "react";
import { Link } from "react-router-dom";
import { Auction } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Pencil,
  Gavel,
  Clock,
  Timer,
  Car,
  Home,
  Package,
} from "lucide-react";
import { DeleteDialog } from "./index";
import { usePlayer } from "@/hooks/usePlayer";
import { parseDate } from "@/utils/date";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AuctionCardProps {
  auction: Auction;
  onRefresh: () => void;
}

const getCategoryLabel = (auction: Auction) => {
  const data = auction.category_data;
  if (!data) return auction.category;

  if (auction.category === "vehicle") {
    return data.vehiclePlate;
  }
  if (auction.category === "property") {
    return data.homeName;
  }
  return `${data.itemLabel || data.itemName} (${data.itemAmount})`;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "vehicle":
      return <Car className="w-16 h-16 text-cyan-400/20" />;
    case "property":
      return <Home className="w-16 h-16 text-cyan-400/20" />;
    case "item":
      return <Package className="w-16 h-16 text-cyan-400/20" />;
    default:
      return null;
  }
};

export const AuctionCard = ({ auction, onRefresh }: AuctionCardProps) => {
  const { player } = usePlayer();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isLive =
    auction.type === "live" && auction.live && !auction.finished_at;
  const isActive = auction.start_time && !auction.finished_at;
  const isSold = auction.finished_at && auction.sold_to;
  const isExpired = auction.finished_at && !auction.sold_to;

  return (
    <>
      <Link to={`/view/${auction.id}`} className="block group h-full">
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-cyan-500/30 transition-all duration-300 h-full flex flex-col">
          {isLive && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
              {auction.category_data?.imageUrl && !imageError ? (
                <img
                  src={auction.category_data.imageUrl}
                  alt={
                    auction.category === "vehicle"
                      ? auction.category_data.vehiclePlate || "Vehicle"
                      : auction.category_data.homeName || "Property"
                  }
                  className={cn("w-full h-full ", auction.category === "item" || auction.category === "vehicle" ? "object-contain" : "object-cover")}
                  onError={() => setImageError(true)}
                />
              ) : null}
              <div
                className={`${auction.category_data?.imageUrl && !imageError ? "hidden" : "flex"} items-center justify-center w-full h-full`}
              >
                <div
                  className={
                    isLive
                      ? "group-hover:scale-110 transition-transform duration-300"
                      : ""
                  }
                >
                  {getCategoryIcon(auction.category)}
                </div>
              </div>
              <div className="absolute top-3 left-3 flex gap-1">
                {!isLive && (
                  <Badge className="bg-blue-500/20 text-cyan-400 border-cyan-500/30 uppercase text-xs font-medium">
                    {auction.type}
                  </Badge>
                )}
                {isSold && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    <Gavel className="w-3 h-3 mr-1" />
                    SOLD
                  </Badge>
                )}
                {isExpired && (
                  <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                    EXPIRED
                  </Badge>
                )}
                {isLive && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                    <Timer className="w-3 h-3 mr-1" />
                    LIVE
                  </Badge>
                )}
              </div>
              {player?.isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isSold && !isExpired && (
                    <Link to={`/edit/${auction.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-slate-800/80 hover:bg-slate-700 border border-cyan-500/30"
                      >
                        <Pencil className="h-3.5 w-3.5 text-cyan-400" />
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-slate-800/80 hover:bg-slate-700 border border-red-500/30"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-cyan-50 group-hover:text-cyan-400 transition-colors">
                  {getCategoryLabel(auction)}
                </h3>
                <p className="text-xs text-slate-400 capitalize">
                  {auction.category}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Starting Bid</span>
                  <span className="text-sm font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    ${auction.starting_price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Min Bid</span>
                  <span className="text-sm font-semibold text-cyan-100">
                    ${auction.minimum_bid.toLocaleString()}
                  </span>
                </div>
                {auction.buyout_price > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Gavel className="w-3 h-3" />
                      Buyout
                    </span>
                    <span className="text-sm font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                      ${auction.buyout_price.toLocaleString()}
                    </span>
                  </div>
                )}

                {isSold && auction.final_price && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Final Price</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                      ${auction.final_price.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {isActive && auction.end_time && (
                <div className="flex items-center gap-1 text-xs text-cyan-400/80 pt-2 border-t border-slate-700/50">
                  <Clock className="w-3 h-3" />
                  <span>
                    Ends: {parseDate(auction.end_time)?.toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
      <DeleteDialog
        auctionId={auction.id}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={onRefresh}
      />
    </>
  );
};
