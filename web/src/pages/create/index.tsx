import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSchema } from "./schema";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchNui } from "@/utils/fetchNui";
import { CategoryFields, TypeFields, PriceFields } from "./components";

type CreateSchema = z.infer<typeof createSchema>;

const CreatePage = () => {
  const form = useForm<CreateSchema>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      category: "vehicle",
      type: "live",
      starting_price: 0,
      minimum_bid: 0,
    },
  });

  const onSubmit = (data: CreateSchema) => {
    fetchNui("createAuction", data);
  };

  return (
    <div className="p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="item">Item</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <CategoryFields form={form} />
          <TypeFields form={form} />
          <PriceFields form={form} />

          <div className="col-span-2">
            <Button
              type="submit"
              className="w-full"
              onClick={() => {
                // debug valid error
                console.log(JSON.stringify(form.formState.errors, null, 2));
              }}
            >
              Create Auction
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreatePage;
