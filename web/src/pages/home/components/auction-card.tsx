import { useState } from "react";
import { Link } from "react-router-dom";
import { Auction } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { DeleteDialog } from "./index";
import { usePlayer } from "@/hooks/usePlayer";

interface AuctionCardProps {
  auction: Auction;
  onRefresh: () => void;
}

const getCategoryLabel = (auction: Auction) => {
  const data = auction.category_data;
  if (!data) return auction.category;

  if (auction.category === "vehicle") {
    return `${data.brand} ${data.model}`;
  }
  if (auction.category === "property") {
    return data.name;
  }
  return data.name;
};

export const AuctionCard = ({ auction, onRefresh }: AuctionCardProps) => {
  const { player } = usePlayer();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base capitalize">
              {getCategoryLabel(auction)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-secondary rounded uppercase">
                {auction.type}
              </span>
              {player?.isAdmin && (
                <div className="flex gap-1">
                  <Link to={`/edit/${auction.id}`}>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Starting: </span>
              <span className="font-medium">
                ${auction.starting_price.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Min Bid: </span>
              <span className="font-medium">
                ${auction.minimum_bid.toLocaleString()}
              </span>
            </div>
            {auction.buyout_price > 0 && (
              <div>
                <span className="text-muted-foreground">Buyout: </span>
                <span className="font-medium">
                  ${auction.buyout_price.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          {auction.category === "vehicle" && auction.category_data?.plate && (
            <div className="mt-2 text-xs text-muted-foreground">
              Plate: {auction.category_data.plate}
            </div>
          )}
          {auction.category === "property" && auction.category_data?.address && (
            <div className="mt-2 text-xs text-muted-foreground">
              {auction.category_data.address}
            </div>
          )}
          {auction.category === "item" && auction.category_data?.amount && (
            <div className="mt-2 text-xs text-muted-foreground">
              Amount: {auction.category_data.amount}
            </div>
          )}
          {auction.start_time && (
            <div className="mt-2 text-xs text-muted-foreground">
              Started: {new Date(auction.start_time).toLocaleString()}
            </div>
          )}
          {auction.end_time && (
            <div className="mt-2 text-xs text-muted-foreground">
              Ends: {new Date(auction.end_time).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        auctionId={auction.id}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={onRefresh}
      />
    </>
  );
};