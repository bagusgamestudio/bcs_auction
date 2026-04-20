import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSchema } from "./schema";

import { Controller, UseFormReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchNui } from "@/utils/fetchNui";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

const CreatePage = () => {
  return <div>Create</div>;
};

export default CreatePage;
