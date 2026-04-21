import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { createSchema } from "../schema";

type PriceFieldsProps = {
  form: UseFormReturn<z.infer<typeof createSchema>>;
};

export const PriceFields = ({ form }: PriceFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="starting_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Starting Price</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="minimum_bid"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Bid</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="buyout_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Buyout Price (Optional)</FormLabel>
            <FormControl>
              <Input
                type="number"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
