"use client"

import {useState} from "react";
import {BuyBot} from "@/components/buy/buyBot";
import {TrendBot} from "@/components/buy/buyTrend";
import {AdsBot} from "@/components/buy/buyAds";
import {PinBot} from "@/components/buy/buyPin";

export function BuyCard () {

    const [buy, setBuy] = useState(false)
    const [trending, setTrending] = useState(false)
    const [ad, setAd] = useState(false)
    const [pin, setPin] = useState(false)

    function toggleBuy () {
        setBuy(!buy);
        if(trending){
            setTrending(false);
        }
        if(ad){
            setAd(false);
        }
        if(pin){
            setPin(false);
        }
    }

    function toggleTrending () {
        setTrending(!trending);
        if(buy){
            setBuy(false);
        }
        if(ad){
            setAd(false);
        }
        if(pin){
            setPin(false);
        }
    }

    function toggleAd () {
        setAd(!ad);
        if(buy){
            setBuy(false);
        }
        if(trending){
            setTrending(false);
        }
        if(pin){
            setPin(false);
        }
    }

    function togglePin () {
        setPin(!pin);
        if (buy) {
            setBuy(false);
        }
        if (trending) {
            setTrending(false);
        }
        if (ad) {
            setAd(false);
        }
    }


    return (
        <>
        <article className="rounded-xl border border-gray-700 bg-gray-800 p-4">
            <div className="flex items-center gap-4">
                <video autoPlay={true} loop={true} height={460} className={"mx-24"}>
                    <source src="/gifs/WifBuy.mp4" type="video/mp4"/>
                </video>
            </div>

            <ul className="mt-4 space-y-2">
                <li>
                    <a onClick={toggleBuy}
                       className="block h-full rounded-lg border border-gray-700 p-4 hover:border-pink-600 text-center">
                        <strong className="font-medium text-white">Apply For Buy Bot</strong>

                        <p className="mt-1 text-xs font-medium text-gray-300">
                            Want your token to be listed on Wif Buy Bot? Apply here. Get your buys listed in our lounge,
                            and get more exposure to the Wif community.
                        </p>

                    </a>
                    {buy && <BuyBot toggle={toggleBuy}/>}
                </li>

                <li>
                    <a onClick={toggleTrending}
                       className="block h-full rounded-lg border border-gray-700 p-4 hover:border-pink-600 text-center">
                        <strong className="font-medium text-white">Purchase Trending Spot</strong>

                        <p className="mt-1 text-xs font-medium text-gray-300">
                            Want to get your token listed on the trending spot? Purchase a spot here.
                        </p>
                    </a>
                    {trending && <TrendBot toggle={toggleTrending}/>}
                </li>

                <li>
                    <a onClick={toggleAd}
                       className="block h-full rounded-lg border border-gray-700 p-4 hover:border-pink-600 text-center">
                        <strong className="font-medium text-white">Purchase Ad Spot</strong>

                        <p className="mt-1 text-xs font-medium text-gray-300">
                            Want to rent out ad space on our Buy Bot? Purchase an ad spot here.
                        </p>
                    </a>
                    {ad && <AdsBot toggle={toggleAd}/>}
                </li>

                <li>
                <a onClick={togglePin}
                       className="block h-full rounded-lg border border-gray-700 p-4 hover:border-pink-600 text-center">
                        <strong className="font-medium text-white">Purchase Pin Post</strong>

                        <p className="mt-1 text-xs font-medium text-gray-300">
                            Want to pin your post on our lounges? Purchase a pin post here. All pinned posts also get a spot
                            on our weekly AMA.
                        </p>
                    </a>
                    {pin && <PinBot toggle={togglePin} />}
                </li>
            </ul>
        </article>
         </>
    )
}