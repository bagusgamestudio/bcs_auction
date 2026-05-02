import { z } from "zod";

const baseSchema = z.object({
  id: z.number().optional(),
  category: z.enum(["vehicle", "property", "item"]),
  type: z.enum(["live", "ongoing"]),
  starting_price: z.number().min(0),
  minimum_bid: z.number().min(0),
  buyout_price: z.number().min(0).optional(),
  start_time: z.date().optional(),
  end_time: z.date().optional(),

  // property
  homeId: z.string().optional(),

  // vehicle
  vehiclePlate: z.string().optional(),

  // item
  itemName: z.string().optional(),
  itemAmount: z.number().optional(),
});

export const auctionSchema = baseSchema.superRefine((data, ctx) => {
  if (data.type === "ongoing") {
    if (!data.start_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date is required for ongoing auction",
        path: ["start_time"],
      });
    }
    if (!data.end_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date is required for ongoing auction",
        path: ["end_time"],
      });
    }
  }

  if (data.category === "property" && !data.homeId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Property is required",
      path: ["homeId"],
    });
  }
  if (data.category === "vehicle" && !data.vehiclePlate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Vehicle is required",
      path: ["vehiclePlate"],
    });
  }
  if (data.category === "item") {
    if (!data.itemName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Item is required",
        path: ["itemName"],
      });
    }
    if (!data.itemAmount || data.itemAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount is required",
        path: ["itemAmount"],
      });
    }
  }
});

export type AuctionSchema = z.infer<typeof auctionSchema>;

export const defaultAuctionValues: Partial<AuctionSchema> = {
  category: "vehicle",
  type: "live",
  starting_price: 0,
  minimum_bid: 0,
  buyout_price: 0,
  start_time: undefined,
  end_time: undefined,
};
