
interface SiteConfig {
    name: string
    title: string
    emoji: string
    description: string
    localeDefault: string
    links: {
        telegram: string
        discord: string
        twitter: string
    }
}

export const siteConfig: SiteConfig = {
    name: "Hat Swap",
    title: "Hat Swap - Fast, Secure, Decentralized Exchange on Solana",
    emoji: "⚡",
    description: "Fast, secure, and easy-to-use decentralized exchange on Solana. Trade SPL tokens with low fees and high speed.",
    localeDefault: "en",
    links: {
        telegram: "https://docs.turboeth.xyz/overview",
        discord: "https://discord.gg/U4jy7Xfh76",
        twitter: "https://twitter.com/district_labs",
    },
}


// You can use any of the other enpoints here
export const NETWORK = "https://neat-magical-butterfly.solana-mainnet.quiknode.pro/efb9ba3fcdb9b70776ee7daac7c3b8d21899bb2c/";

export const trendPrices = [
    0,
    0.5,
    1,
    1.8,
    2.6,
    3.5,
    6
]

export const trendTimes = [
    0,
    2,
    4,
    8,
    12,
    24,
    48
]

export const adPrices = [
    0,
    0.5,
    1,
    1.5,
    2,
    3.5
]

export const adTimes = [
    0,
    2,
    4,
    8,
    12,
    24
]

export const PIN_COST = 1.0