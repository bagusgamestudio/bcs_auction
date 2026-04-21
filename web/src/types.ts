export enum HouseType {
  Shell = "shell",
  Teleport = "teleport",
  MLO = "mlo",
}

export interface Auction {
  id: number;
  identifier: string;
  type: "live" | "ongoing";
  category: "vehicle" | "property" | "item";
  starting_price: number;
  minimum_bid: number;
  buyout_price: number;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}
