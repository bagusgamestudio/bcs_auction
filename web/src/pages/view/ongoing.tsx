import { useNavigate } from "react-router-dom";
import { Auction } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Timer, Car, Home, Package } from "lucide-react";
import { parseDate } from "@/utils/date";
import ListBids from "./bids";
import Bid from "./bid";

interface OnGoingViewProps {
  data: Auction;
}

const OnGoingView = ({ data }: OnGoingViewProps) => {
  const navigate = useNavigate();

  const getCategoryInfo = () => {
    if (data.category === "vehicle") {
      return {
        label: data.category_data?.vehiclePlate || "Vehicle",
        icon: <Car className="w-16 h-16 text-cyan-400/20" />
      };
    }
    if (data.category === "property") {
      return {
        label: data.category_data?.homeName || "Property",
        icon: <Home className="w-16 h-16 text-cyan-400/20" />
      };
    }
    return {
      label: data.category_data?.itemLabel || data.category_data?.itemName || "Item",
      icon: <Package className="w-16 h-16 text-cyan-400/20" />
    };
  };

  const info = getCategoryInfo();
  const endTime = parseDate(data.end_time);

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
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
          <Timer className="w-3 h-3 mr-1" />
          ONGOING
        </Badge>
      </div>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-green-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          {data.category_data?.imageUrl ? (
            <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={data.category_data.imageUrl}
                alt={info.label}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center">{info.icon}</div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-cyan-50 mb-2">{info.label}</h1>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-500/20 text-cyan-400 border-cyan-500/30 capitalize">
                {data.category}
              </Badge>
              <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">
                {data.type}
              </Badge>
            </div>
          </div>
          {endTime && (
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Ends At</p>
              <p className="text-lg font-semibold text-cyan-400">
                {endTime.toLocaleDateString()}
              </p>
              <p className="text-sm text-slate-400">
                {endTime.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        <Bid data={data} />

        <div className="mt-6">
          <ListBids data={data} />
        </div>
      </div>
    </div>
  );
};

export default OnGoingView;
