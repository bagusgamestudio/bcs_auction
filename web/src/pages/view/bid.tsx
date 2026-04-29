import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Auction } from "@/types";
import { fetchNui } from "@/utils/fetchNui";
import { formatTime } from "@/utils/misc";

const Bid = ({ data }: { data: Auction }) => {
  const [bidAmount, setBidAmount] = useState("");

  const currentHighest = data.bids?.length
    ? Math.max(...data.bids.map((b) => b.amount))
    : data.starting_price;

  const minimumBid = currentHighest + data.minimum_bid;

  function onSubmit() {
    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount < minimumBid) return;
    fetchNui("placeBid", { id: data.id, amount });
    setBidAmount("");
  }

  const timeLeft = data.live?.timeLeft || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Place Bid</CardTitle>
        {data.live?.timeLeft !== undefined && (
          <div className={`text-2xl font-bold font-mono ${timeLeft <= 10 ? "text-red-500" : "text-yellow-500"}`}>
            {formatTime(timeLeft)}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Current Highest</div>
          <div className="font-medium">${currentHighest.toLocaleString()}</div>
          <div className="text-muted-foreground">Minimum Bid</div>
          <div className="font-medium text-yellow-600">
            ${minimumBid.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={`Min: $${minimumBid.toLocaleString()}`}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          />
          <Button onClick={onSubmit} disabled={!bidAmount || parseInt(bidAmount) < minimumBid}>
            Place Bid
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Bid;
