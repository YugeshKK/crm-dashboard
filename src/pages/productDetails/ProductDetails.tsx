import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";

export interface ProductDetailsProps {
}

export function ProductDetails (props: ProductDetailsProps) {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  return (
    <div>
        <Button onClick={() => navigate(-1)}>← Products</Button>
        Hello This is product details page for product {productId}
    </div>
  );
}


export default ProductDetails;