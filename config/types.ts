export type WebhookData = {
    accountData: Array<{ } >;
    description: string;
    fee: number;
    feePayer: string;
    nativeTransfers: Array<{  }>;
    signature: string;
    slot: number;
    source: string;
    timestamp: number;
    tokenTransfers: Array<tokenTransfers>;
    type: string;
}

type accountData = {
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: Array<tokenBalanceChanges>;
}

type tokenBalanceChanges = {
    mint: string;
    rawTokenAmount: {
        decimals: number;
        tokenAmount: string;
    };
    tokenAccount: string;
    userAccount: string;
}

type events = {

}

type nativeTransfers = {
    amount: number;
    fromUserAccount: string;
    toUserAccount: string;
}

type tokenTransfers = {
    fromTokenAccount: string;
    fromUserAccount: string;
    mint: string;
    toTokenAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    tokenStandard: string;
}

type pools = {
    poolId: string;
    liquidity: {}
    price: {}
    tokenSupply: number;

}

export interface Details {
    sol: number;
    token: number;
    toAccount: string;
    signature: string;
    id: string;
    tokenName: string;
    tokenAddress: string;
    botChannels: string[];
    tag: string;
}

export interface BuyMessage {
    details: Details;
    spent: number;
    position: string;
    cap: number;
    price: string;
    trending: number;
}

export const SOL_ADDRESS = 'So11111111111111111111111111111111111111112'

