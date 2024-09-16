"use client"

import {BuyCard} from "@/components/buy/buyCard";
import {Toaster} from "react-hot-toast";
import {StartBot} from "@/integrate/promotBot";

export default function Home() {

  return (
        <div className="container mx-auto">
            <BuyCard />
        </div>
  )
}
