import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Auction } from "@/types";
import { fetchNui } from "@/utils/fetchNui";
import { formatTime } from "@/utils/misc";
import { Gavel, Timer, DollarSign } from "lucide-react";

const Bid = ({ data }: { data: Auction }) => {
  const [bidAmount, setBidAmount] = useState("");
  const [buyoutOpen, setBuyoutOpen] = useState(false);

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

  function onBuyout() {
    fetchNui("buyout", { id: data.id });
    setBuyoutOpen(false);
  }

  const timeLeft = data.live?.timeLeft || 0;

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-cyan-500/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-cyan-400" />
          <CardTitle className="text-cyan-50">Place Your Bid</CardTitle>
        </div>
        {data.live?.timeLeft !== undefined && (
          <div className={`flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
            <Timer className="w-4 h-4" />
            <span className="text-2xl font-bold font-mono">
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Current Highest</p>
            <p className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              ${currentHighest.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Minimum Bid
            </p>
            <p className="text-xl font-semibold text-cyan-100">
              ${minimumBid.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="number"
              placeholder={`Min: $${minimumBid.toLocaleString()}`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              className="pl-10 bg-slate-800/50 border-cyan-500/30 focus:border-cyan-400"
            />
          </div>
          <Button
            onClick={onSubmit}
            disabled={!bidAmount || parseInt(bidAmount) < minimumBid}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
          >
            <Gavel className="w-4 h-4 mr-2" />
            Place Bid
          </Button>
        </div>
        {data.buyout_price > 0 && (
          <Dialog open={buyoutOpen} onOpenChange={setBuyoutOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <Gavel className="w-4 h-4 mr-2" />
                Buyout for ${data.buyout_price.toLocaleString()}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-cyan-500/30">
              <DialogHeader>
                <DialogTitle className="text-cyan-50">Confirm Buyout</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Are you sure you want to buyout for $
                  {data.buyout_price.toLocaleString()}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setBuyoutOpen(false)}
                  className="text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onBuyout}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500"
                >
                  Confirm Buyout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default Bid;
