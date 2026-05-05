import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchNui } from "@/utils/fetchNui";
import { Auction } from "@/types";
import { AuctionForm } from "@/components/auction-form";
import { Button } from "@/components/ui/button";
import { parseDate } from "@/utils/date";
import { Pencil, ArrowLeft } from "lucide-react";

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuction = async () => {
      if (!id) return;
      try {
        const data = await fetchNui<Auction>("getAuctionById", {
          id: Number(id),
        });
        setAuction(data || null);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

  if (loading) return (
    <div className="p-8 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent">
      </div>
      <p className="mt-4 text-slate-400">Loading auction...</p>
    </div>
  );

  if (!auction) return (
    <div className="p-8 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <p className="text-slate-400">Auction not found</p>
    </div>
  );

  const defaultValues = {
    id: auction.id,
    category: auction.category,
    type: auction.type,
    starting_price: auction.starting_price,
    minimum_bid: auction.minimum_bid,
    buyout_price: auction.buyout_price,

    start_time: parseDate(auction.start_time),
    end_time: parseDate(auction.end_time),

    homeId: auction.category_data?.homeId,
    imageUrl: auction.category_data?.imageUrl,
    vehiclePlate: auction.category_data?.vehiclePlate,
    itemName: auction.category_data?.itemName,
    itemAmount: auction.category_data?.itemAmount,
    itemLabel: auction.category_data?.itemLabel,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-cyan-400"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
          <Pencil className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Edit Auction
          </h1>
          <p className="text-sm text-slate-400">Update auction details below</p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
        <AuctionForm
          defaultValues={defaultValues}
          onSuccess={() => navigate("/")}
        />
      </div>
    </div>
  );
};

export default EditPage;
