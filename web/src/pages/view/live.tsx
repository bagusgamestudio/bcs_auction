import { useNavigate } from "react-router-dom";
import { Auction } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Radio, Car, Home, Package } from "lucide-react";
import ListBids from "./bids";
import Bid from "./bid";
import { useEffect, useState } from "react";

interface LiveViewProps {
  data: Auction;
}

const LiveView = ({ data }: LiveViewProps) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(data.live?.timeLeft || 0);

  useEffect(() => {
    if (!data.live?.timeLeft) return;
    setTimeLeft(data.live.timeLeft);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [data.live?.timeLeft]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse flex items-center gap-1">
          <Radio className="w-3 h-3 animate-pulse" />
          LIVE
        </Badge>
      </div>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex items-center justify-center">{info.icon}</div>
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
          {timeLeft > 0 && (
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Time Left</p>
              <div className={`text-4xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                {formatTime(timeLeft)}
              </div>
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

export default LiveView;
