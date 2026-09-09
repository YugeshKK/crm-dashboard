import { Button } from "@/components/ui/button";
import { Container, GitGraphIcon, MoveLeft, PencilIcon, Plus, ShelvingUnit, ShoppingCart, Summary } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ProductOverview from "./productsDetailsTabs/ProductOverview";
import { useEffect, useState } from "react";

export interface ProductDetailsProps {
}

export function ProductDetails (props: ProductDetailsProps) {
  const navigate = useNavigate();  
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>( searchParams.get("tab") || "overview");


  const handleTabChange=(tab:string)=>{
    setSearchParams({tab});
    setActiveTab(tab);
  }

  useEffect(()=>{
    setSearchParams({activeTab});
  },[])

  const { productId } = useParams<{ productId: string }>();
  return (
    <div className="flex flex-col h-screen gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-2 items-center">
          <Button className="flex items-center gap-2" variant="ghost" onClick={() => navigate('/products')}>
            <MoveLeft/>
            Products
          </Button>
          <p>Solar sales panel 550W</p>
        </div>
        <div className="flex flex-row gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <PencilIcon/>
            Edit Product
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Plus/>
            Add Stock
          </Button>
        </div>
      </div>
      <div className="flex flex-row gap-4 justify-between align-items-center">
        <div className="flex flex-row gap-4 pb-8">
          <div className="relative flex flex-col rounded overflow-hidden h-fit">
            <img className="size-50" src="https://picsum.photos/200/300" alt="" />
            <div className="absolute bottom-2 left-2 w-fit rounded bg-white/80 px-2 py-1 text-sm text-black cursor-pointer hover:bg-white/90 transition-all duration-200">
              <p>5 images</p>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-4 items-center">
              <h4>Solar Panel 550 W</h4>
              <div className="bg-green-500 text-white px-2 py-1 rounded-xl text-sm">Active</div>
            </div>
            <div className="flex flex-row gap-7">
              <div>SP-550</div>
              <div>Solar Panels</div>
              <div>High efficiency mono panel</div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-500 max-w-[600px]">
              <p>lore ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col gap-1">
                <p>Selling Price</p>
                <p className="font-bold">$ 25,000</p>
              </div>
              <div className="flex flex-col gap-1">
                <p>Cost Price</p>
                <p className="font-bold">$ 20,000</p>
              </div>
              <div className="flex flex-col gap-1">
                <p>Warranty</p>
                <p className="font-bold">5 years</p>
              </div>
              <div className="flex flex-col gap-1">
                <p>Unit</p>
                <p className="font-bold">Piece</p>
              </div>
              <div className="flex flex-col gap-1">
                <p>HSN Code</p>
                <p className="font-bold">8479.89.00</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 border border-gray-300 rounded-xl p-4 h-fit">
          <div>
            <h4 className="font-bold">Stock Overview</h4>
          </div>
          <div className="flex flex-row gap-20">
            <div className="flex flex-col gap-1 align-items-center justify-center">
              <p className="text-gray-500">Available Stock</p>
              <p className="font-bold text-green-500">100</p>
              <p className="text-green-600  rounded-xl w-fit  px-2 bg-green-50 text-center">In stock</p>
            </div>
            <div className="flex flex-col gap-2 align-items-center justify-center">
              <div className="flex flex-row gap-10 align-items-center justify-start">
                <p className="min-w-fit">Reserved</p>
                <p className="w-full text-end">10</p>
              </div>
              <div className="flex flex-row gap-10 align-items-center justify-start">
                <p className="min-w-fit" >Incoming</p>
                <p className="w-full text-end">50</p>
              </div>
              <div className="flex flex-row gap-10 align-items-center justify-start">
                <p className="min-w-fit">Reorder Value</p>
                <p className="w-full text-end">20</p>
              </div>
              <div className="flex flex-row gap-10 align-items-center justify-start">
                <p className="min-w-fit">Stock Value</p>
                <p className="w-full text-end">$ 2,500</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-4 border-b-2 pb-2">
        <Button  
          className="flex items-center gap-2"
          variant="outline"
          onClick={()=>handleTabChange('overview')}
          >
          <Summary/>
          Overview
        </Button>
        <Button 
          variant="outline" className="flex items-center gap-2"
          onClick={()=> handleTabChange('inventory') }
          >
          <ShelvingUnit />
          Inventory
        </Button>
        <Button 
          variant="outline" className="flex items-center gap-2"
          onClick={()=> handleTabChange('sp')}
        >
          <GitGraphIcon />
          Sales and performance 
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Container />
          Suppliers
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <ShoppingCart/>
          Buyers
        </Button>
      </div>

      {activeTab === "overview" && <ProductOverview />}
      {activeTab === "inventory" && <div>Inventory</div>}
      {activeTab === "sp" && <div>Sales and performance </div>}
    </div>
  );
}


export default ProductDetails;