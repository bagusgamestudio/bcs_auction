import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchNui } from "@/utils/fetchNui";
import { Auction } from "@/types";
import { Button } from "@/components/ui/button";

const ViewPage = () => {
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

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate("/")}>
          Back
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <span className="text-muted-foreground">Category: </span>
          <span className="font-medium capitalize">{auction.category}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Type: </span>
          <span className="font-medium">{auction.type}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Starting Price: </span>
          <span className="font-medium">${auction.starting_price.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Minimum Bid: </span>
          <span className="font-medium">${auction.minimum_bid.toLocaleString()}</span>
        </div>
        {auction.buyout_price > 0 && (
          <div>
            <span className="text-muted-foreground">Buyout Price: </span>
            <span className="font-medium">${auction.buyout_price.toLocaleString()}</span>
          </div>
        )}
        {auction.category === "vehicle" && auction.category_data?.vehiclePlate && (
          <div>
            <span className="text-muted-foreground">Plate: </span>
            <span className="font-medium">{auction.category_data.vehiclePlate}</span>
          </div>
        )}
        {auction.category === "property" && auction.category_data?.homeId && (
          <div>
            <span className="text-muted-foreground">Property: </span>
            <span className="font-medium">{auction.category_data.homeId}</span>
          </div>
        )}
        {auction.category === "item" && auction.category_data && (
          <>
            <div>
              <span className="text-muted-foreground">Item: </span>
              <span className="font-medium">{auction.category_data.itemLabel || auction.category_data.itemName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Amount: </span>
              <span className="font-medium">{auction.category_data.itemAmount}</span>
            </div>
          </>
        )}
        {auction.start_time && (
          <div>
            <span className="text-muted-foreground">Started: </span>
            <span className="font-medium">{new Date(auction.start_time).toLocaleString()}</span>
          </div>
        )}
        {auction.end_time && (
          <div>
            <span className="text-muted-foreground">Ends: </span>
            <span className="font-medium">{new Date(auction.end_time).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPage;