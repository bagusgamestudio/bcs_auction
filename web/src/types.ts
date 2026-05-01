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
  start_time: string | null;
  end_time: string | null;
  finished_at: string | null;

  bids?: Bid[];

  live?: {
    id: number;
    state: string;
    timeLeft: number;
  };
}

type Bid = {
  amount: number;
  time: string;
  identifier: string;
  name: string;
};
