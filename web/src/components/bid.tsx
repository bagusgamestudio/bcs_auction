import { useNuiEvent } from "@/hooks/useNuiEvent";
import { Auction } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { fetchNui } from "@/utils/fetchNui";
import Bid from "@/pages/view/bid";
import { cn } from "@/lib/utils";
import { useKey } from "@/hooks/useKey";

const BidDialog = () => {
  const [visible, setVisible] = useState(false);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  useNuiEvent<{ auction: Auction; show: boolean; step: 1 | 2 }>(
    "showBid",
    (data) => {
      if (data.show) {
        setAuction(data.auction);
        setVisible(true);
        setStep(data.step);
      } else {
        setVisible(false);
      }
    },
  );

  useNuiEvent<{
    id: number;
    key: keyof Auction;
    value: Auction[keyof Auction];
  }>("updateAuction", (data) => {
    setAuction((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [data.key]: data.value,
      };
    });
  });

  useKey("Escape", () => {
    if (visible) {
      fetchNui("closeFrame");
      setVisible(false);
    }
  }, [visible]);

  if (auction === null) return null;

  const currentHighest = auction.bids?.length
    ? Math.max(...auction.bids.map((b) => b.amount))
    : auction.starting_price;

  const minimumBid = currentHighest + auction.minimum_bid;

  function onMinBidConfirm() {
    if (!auction) return;
    fetchNui("placeBid", { id: auction.id, amount: minimumBid, close: true });
    setVisible(false);
  }

  if (!visible) return null;

  if (step === 1) {
    return (
      <Dialog
        open={visible}
        onOpenChange={(open) => {
          if (!open) {
            fetchNui("closeFrame");
            setVisible(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Minimum Bid</DialogTitle>
            <DialogDescription>
              Are you sure you want to bid ${minimumBid.toLocaleString()}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onMinBidConfirm}>Confirm </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div
      className={cn(
        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
      )}
    >
      <Bid data={auction} />;
    </div>
  );
};

export default BidDialog;
