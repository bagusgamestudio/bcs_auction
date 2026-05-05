import { ScrollArea } from "@/components/ui/scroll-area";
import { Auction } from "@/types";
import { Gavel } from "lucide-react";

const ListBids = ({ data }: { data: Auction }) => {
  const sortedBids = data.bids?.sort((a, b) => b.amount - a.amount) || [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Gavel className="w-4 h-4 text-cyan-400" />
        <h3 className="text-lg font-semibold text-cyan-50">Bid History</h3>
        <span className="text-xs text-slate-400 ml-auto">
          {sortedBids.length} bid{sortedBids.length !== 1 ? 's' : ''}
        </span>
      </div>
      <ScrollArea className="h-64 rounded-xl border border-cyan-500/20 bg-slate-800/30">
        <div className="p-4 space-y-3">
          {sortedBids.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No bids yet</p>
            </div>
          ) : (
            sortedBids.map((bid, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-cyan-100">{bid.name}</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    ${bid.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{bid.time}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ListBids;
