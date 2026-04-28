import { useNavigate } from "react-router-dom";
import { Auction } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import ListBids from "./bids";
import Bid from "./bid";

interface LiveViewProps {
  data: Auction;
}

const LiveView = ({ data }: LiveViewProps) => {
  const navigate = useNavigate();

  const getCategoryInfo = () => {
    if (data.category === "vehicle") {
      return data.category_data?.vehiclePlate || "Vehicle";
    }
    if (data.category === "property") {
      return data.category_data?.homeName || "Property";
    }
    return (
      data.category_data?.itemLabel || data.category_data?.itemName || "Item"
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Badge>LIVE</Badge>
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold">{getCategoryInfo()}</h1>
        <p className="text-muted-foreground capitalize">
          {data.category} Auction
        </p>
        {data.live?.startTime && (
          <p className="text-sm text-muted-foreground">
            Started: {new Date(data.live?.startTime * 1000).toLocaleString()}
          </p>
        )}
      </div>

      <Bid data={data} />

      <ListBids data={data} />
    </div>
  );
};

export default LiveView;
