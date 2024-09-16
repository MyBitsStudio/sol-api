import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import {NETWORK} from "@/config/site";

export type TxCreateData = {
  tx: string;
};

export type Input = {
  payerAddress: string;
  receiverAddress?: string;
  amount?: number;
  type: "sol" | "token";
  tokenAddress?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TxCreateData>
) {
  if (req.method === "POST") {
    const {
      payerAddress,
      amount ,
    } = req.body as Input;

    const receiverAddress = "3H3aVKZN3pb9Kmd2pfQnAexPKQk2AGnFwLVtLNVp5twK";
    const connection = new Connection(NETWORK);

    const payer = new PublicKey(payerAddress);
    const receiver = new PublicKey(receiverAddress);

    let transaction = new Transaction();

    console.log("amount", amount)

    transaction.add(
        SystemProgram.transfer({
          fromPubkey: payer,
          toPubkey: receiver,
          lamports: amount as number * LAMPORTS_PER_SOL,
        })
    );

    console.log("transaction", transaction)

    const blockHash = (await connection.getLatestBlockhash("finalized"))
      .blockhash;

    console.log("blockHash", blockHash)

    transaction.feePayer = payer;
    transaction.recentBlockhash = blockHash;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: true,
    });

    console.log("serializedTransaction", serializedTransaction)

    const transactionBase64 = serializedTransaction.toString("base64");

    console.log("transactionBase64", transactionBase64)

    res.status(200).json({ tx: transactionBase64 });
  } else {
    console.log("405")
    res.status(405).json({ tx: "" });
  }
}
