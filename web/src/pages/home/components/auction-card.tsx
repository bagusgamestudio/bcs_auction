import { Auction } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuctionCardProps {
  auction: Auction;
}

export const AuctionCard = ({ auction }: AuctionCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base capitalize">
            {auction.category}
          </CardTitle>
          <span className="text-xs px-2 py-1 bg-secondary rounded uppercase">
            {auction.type}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Starting: </span>
            <span className="font-medium">${auction.starting_price.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Min Bid: </span>
            <span className="font-medium">${auction.minimum_bid.toLocaleString()}</span>
          </div>
          {auction.buyout_price > 0 && (
            <div>
              <span className="text-muted-foreground">Buyout: </span>
              <span className="font-medium">${auction.buyout_price.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};