import { z } from "zod";

export const auctionSchema = z.object({
  id: z.number().optional(),
  category: z.enum(["vehicle", "property", "item"]),
  type: z.enum(["live", "ongoing"]),
  starting_price: z.number().min(0),
  minimum_bid: z.number().min(0),
  buyout_price: z.number().min(0).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  plate: z.string().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
  amount: z.number().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
});

export type AuctionSchema = z.infer<typeof auctionSchema>;

export const defaultAuctionValues: Partial<AuctionSchema> = {
  category: "vehicle",
  type: "live",
  starting_price: 0,
  minimum_bid: 0,
  brand: "",
  model: "",
  plate: "",
  name: "",
  address: "",
  amount: 1,
};