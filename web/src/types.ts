export interface AuctionCategoryData {
  brand?: string;
  model?: string;
  plate?: string;
  name?: string;
  address?: string;
  amount?: number;
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
  created_at: string;
  updated_at: string;
}
