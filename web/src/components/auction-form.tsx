import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { fetchNui } from "@/utils/fetchNui";
import { auctionSchema, AuctionSchema, defaultAuctionValues } from "@/schemas/auction";
import { DateTimePicker } from "@/components/ui/date-time-picker";

interface AuctionFormProps {
  defaultValues?: Partial<AuctionSchema>;
  onSuccess?: () => void;
}

export const AuctionForm = ({ defaultValues, onSuccess }: AuctionFormProps) => {
  const navigate = useNavigate();
  const isEdit = !!defaultValues?.id;

  const form = useForm<AuctionSchema>({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      ...defaultAuctionValues,
      ...defaultValues,
    } as AuctionSchema,
  });

  const onSubmit = (data: AuctionSchema) => {
    const payload = isEdit
      ? { id: defaultValues!.id, ...data }
      : data;

    fetchNui(isEdit ? "updateAuction" : "createAuction", payload).then(() => {
      navigate("/");
      onSuccess?.();
    });
  };

  const category = form.watch("category");
  const type = form.watch("type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === "live" && (
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Start Date (Optional)</FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Now"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {type === "ongoing" && (
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select end date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {category === "vehicle" && (
          <>
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plate"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Plate</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {category === "property" && (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {category === "item" && (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
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
          </>
        )}

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
            <FormItem className="col-span-2">
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

        <div className="col-span-2">
          <Button type="submit" className="w-full">
            {isEdit ? "Update Auction" : "Create Auction"}
          </Button>
        </div>
      </form>
    </Form>
  );
};