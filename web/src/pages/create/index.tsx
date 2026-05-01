import { AuctionForm } from "@/components/auction-form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CreatePage = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/")}>
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create Auction</h1>
      </div>
      <AuctionForm />
    </div>
  );
};

export default CreatePage;
