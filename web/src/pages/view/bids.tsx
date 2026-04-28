import { ScrollArea } from "@/components/ui/scroll-area";
import { Auction } from "@/types";

const ListBids = ({ data }: { data: Auction }) => {
  return (
    <div>
      <div className="text-lg font-bold">Bids</div>
      <ScrollArea className="h-64 border rounded-md p-4">
        <div className="space-y-2">
          {data.live?.bids?.sort((a, b) => b.amount - a.amount).map((bid, index) => (
            <div key={index} className="p-4 bg-card">
              <p className="text-muted-foreground">{bid.identifier}</p>
              <p className="text-muted-foreground">Bid: {bid.amount}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ListBids;
