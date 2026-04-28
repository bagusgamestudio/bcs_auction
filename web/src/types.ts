export interface AuctionCategoryData {
  homeId: string;
  homeName: string;

  vehiclePlate: string;
  coords: {
    x: number;
    y: number;
    z: number;
    w: number;
  };

  itemName: string;
  itemLabel: string;
  itemAmount: number;
}

export interface Auction {
  id: number;
  identifier: string;
  type: "live" | "ongoing";
  category: "vehicle" | "property" | "item";
  category_data: AuctionCategoryData | null;
  starting_price: number;
  minimum_bid: number;
  buyout_price: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;

  live?: {
    id: number;
    startTime: number;
    bids: Bid[];
    timeLeft: number;
  };
}

type Bid = {
  id: number;
  amount: number;
  date: string;
  identifier: string;
};
