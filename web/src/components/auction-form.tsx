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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { fetchNui } from "@/utils/fetchNui";
import {
  auctionSchema,
  AuctionSchema,
  defaultAuctionValues,
} from "@/schemas/auction";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useEffect, useState } from "react";
import { formatDate } from "@/utils/date";

interface AuctionFormProps {
  defaultValues?: Partial<AuctionSchema>;
  onSuccess?: () => void;
}

interface Option {
  value: string;
  label: string;
}

export const AuctionForm = ({ defaultValues, onSuccess }: AuctionFormProps) => {
  const navigate = useNavigate();
  const isEdit = !!defaultValues?.id;
  const [options, setOptions] = useState<Option[]>([]);

  const form = useForm<AuctionSchema>({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      ...defaultAuctionValues,
      ...defaultValues,
    } as AuctionSchema,
  });

  const onSubmit = (data: AuctionSchema) => {
    const payload = isEdit ? { id: defaultValues!.id, ...data } : data;

    if (payload.start_time) {
      payload.start_time = formatDate(payload.start_time as unknown as Date) as any;
    }
    if (payload.end_time) {
      payload.end_time = formatDate(payload.end_time as unknown as Date) as any;
    }

    fetchNui(isEdit ? "updateAuction" : "createAuction", payload).then(
      (success) => {
        if (!success) return;
        navigate("/");
        onSuccess?.();
      },
    );
  };

  const category = form.watch("category");
  const type = form.watch("type");

  useEffect(() => {
    const getCategoryOptions = async () => {
      const categoryOptions: Record<string, string> = {
        vehicle: "getVehicles",
        property: "getProperties",
        item: "getItems",
      };

      const options = await fetchNui<Option[]>(
        categoryOptions[category],
        null,
        MOCK_DATA_OPTIONS,
      );
      setOptions(options);
    };

    getCategoryOptions();
  }, [category]);

  const getFormFieldName = (category: string) => {
    const fieldMap: Record<string, "homeId" | "vehiclePlate" | "itemName"> = {
      property: "homeId",
      vehicle: "vehiclePlate",
      item: "itemName",
    };
    return fieldMap[category];
  };

  const SelectOptions = ({ category }: { category: string }) => {
    const catagoryLabels: Record<string, string> = {
      vehicle: "Vehicle",
      property: "Property",
      item: "Item Name",
    };

    return (
      <FormField
        name={getFormFieldName(category)}
        render={({ field }) => (
          <FormItem className={`col-span-${category === "item" ? 1 : 2}`}>
            <FormLabel>{catagoryLabels[category]}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
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
              <Select onValueChange={field.onChange} value={field.value}>
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
              <Select onValueChange={field.onChange} value={field.value}>
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

        {type === "ongoing" && (
          <>
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date *</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select start date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date *</FormLabel>
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
          </>
        )}

        {category === "vehicle" && (
          <>
            <SelectOptions category={category} />
          </>
        )}

        {category === "property" && (
          <>
            <SelectOptions category={category} />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Image URL *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/image.jpg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {category === "item" && (
          <>
            <SelectOptions category={category} />
            <FormField
              control={form.control}
              name="itemAmount"
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
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
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

const MOCK_DATA_OPTIONS = [
  { label: "Option 1", value: "option-1" },
  { label: "Option 2", value: "option-2" },
  { label: "Option 3", value: "option-3" },
  { label: "Option 4", value: "option-4" },
  { label: "Option 5", value: "option-5" },
];
