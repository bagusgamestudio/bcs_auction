import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchNui } from "@/utils/fetchNui";
import { Auction } from "@/types";
import { AuctionForm } from "@/components/auction-form";
import { Button } from "@/components/ui/button";

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

  if (loading) return <div className="p-4">Loading...</div>;
  if (!auction) return <div className="p-4">Auction not found</div>;

  const defaultValues = {
    id: auction.id,
    category: auction.category,
    type: auction.type,
    starting_price: auction.starting_price,
    minimum_bid: auction.minimum_bid,
    buyout_price: auction.buyout_price,

    homeId: auction.category_data?.homeId,
    vehiclePlate: auction.category_data?.vehiclePlate,
    coords : auction.category_data?.coords,
    itemName: auction.category_data?.itemName,
    itemAmount: auction.category_data?.itemAmount,
    itemLabel: auction.category_data?.itemLabel,
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate("/")}>
          Back
        </Button>
      </div>
      <AuctionForm
        defaultValues={defaultValues}
        onSuccess={() => navigate("/")}
      />
    </div>
  );
};

export default EditPage;
