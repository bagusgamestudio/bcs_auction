import { z } from "zod";

const baseSchema = z.object({
  starting_price: z.number().min(0),
  minimum_bid: z.number().min(0),
  buyout_price: z.number().min(0).optional(),
  start_date: z.date().optional(),
});

const vehicleSchema = z.object({
  category: z.literal("vehicle"),
  brand: z.string(),
  model: z.string(),
  plate: z.string(),
});

const propertySchema = z.object({
  category: z.literal("property"),
  name: z.string(),
  address: z.string(),
});

const itemSchema = z.object({
  category: z.literal("item"),
  name: z.string(),
  amount: z.number(),
});

const categorySchema = z.discriminatedUnion("category", [
  vehicleSchema,
  propertySchema,
  itemSchema,
]);

const liveSchema = z.object({
  type: z.literal("live"),
});

const ongoingSchema = z.object({
  type: z.literal("ongoing"),
  end_date: z.date(),
});

const typeSchema = z.discriminatedUnion("type", [liveSchema, ongoingSchema]);

export const createSchema = baseSchema.and(categorySchema).and(typeSchema);
