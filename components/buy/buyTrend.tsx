import {MouseEventHandler, useState} from "react";
import {GridLoader} from "react-spinners";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {requestAPI} from "@/utils/api";
import {useWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {PublicKey, Transaction} from "@solana/web3.js";
import {fetcher} from "@/utils/use-data-fetch";
import {TxCreateData} from "@/remove/create";
import {TxSendData} from "@/remove/send";
import {trendPrices} from "@/config/site";
import {TxConfirmData} from "@/remove/confirm";


export function TrendBot(props: { toggle: MouseEventHandler<HTMLButtonElement> | undefined; }) {

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [tag, setTag] = useState('');
    const [owner, setOwner] = useState('');
    const[telegram, setTelegram] = useState(0);
    const [loading, setLoading] = useState(false);
    const [length, setLength] = useState(0);
    const [channel, setChannel] = useState('');

    const { publicKey, signTransaction, connected } = useWallet();
    const [txState, setTxState] = useState("initial");

    function verifyData(data: any) {

        if(data.name == null || data.address == null || data.tag == null || data.owner == null || data.telegram == null) {
            toast.error("Please fill out all fields");
            return false;
        }

        if(data.name.length <= 3){
            toast.error("Please enter a valid token name.");
            return false;
        }

        if(data.address.length <= 24){
            toast.error("Please verify your token address.");
            return false;
        }

        if(data.tag.length <= 3){
            toast.error("Please enter a valid token ticker.");
            return false;
        }

        if(data.tag.toString().includes("$")){
            toast.error("Please enter a valid token ticker without $.");
            return false;
        }

        if(data.owner.length <= 12){
            toast.error("Please enter a valid owner address.");
            return false;
        }

        if(data.telegram.toString().includes("@")){
            toast.error("Telegram ID should not include @");
            return false;
        }

        if(data.telegram.length <= 2){
            toast.error("Please enter a valid telegram username.");
            return false;
        }

        if(data.length === 0){
            toast.error("Please select a length.");
            return false;
        }

        if(data.channel === ''){
            toast.error("Please select a channel.");
            return false;
        }

        return true;

    }

    function handleSubmit(e: { preventDefault: () => void; }){
        e.preventDefault();
        console.log(name, address, tag);
        setLoading(true);

        if(name === '' || address === '' || tag === '' || owner === '' || telegram === 0 || length === 0 || channel === ''){
            toast.error("Please fill out all fields");
            setLoading(false);
            return;
        }

        if(!verifyData({name: name, address: address, tag: tag, owner: owner, telegram: telegram, length: length, channel: channel})){
            setLoading(false);
            return;
        }


        void onTxClick();

    }

    const onTxClick = () => {
        async function run() {
            if (connected && publicKey && signTransaction && txState !== "loading") {
                setTxState("loading");
                toast.info("Creating transaction...");

                const price = trendPrices[length];

                try {
                    // Create transaction
                    let {tx: txCreateResponse} = await fetcher<TxCreateData>(
                        "/api/tx/create",
                        {
                            method: "POST",
                            headers: {
                                'Accept': 'application/json',
                                "Content-type": "application/json; charset=UTF-8"
                            },
                            body: JSON.stringify({
                                payerAddress: publicKey.toBase58(),
                                amount: price
                            }),

                        }
                    );

                    const tx = Transaction.from(Buffer.from(txCreateResponse, "base64"));

                    // Request signature from wallet
                    const signedTx = await signTransaction(tx);
                    const signedTxBase64 = signedTx.serialize().toString("base64");

                    // Send signed transaction
                    let {txSignature} = await fetcher<TxSendData>("/api/tx/send", {
                        method: "POST",
                        body: JSON.stringify({signedTx: signedTxBase64}),
                        headers: {"Content-type": "application/json; charset=UTF-8"},
                    });

                    setTxState("success");
                    toast.success(
                        (t) => (
                            <a
                                href={`https://solscan.io/tx/${txSignature}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Transaction created
                            </a>
                        )
                    );

                    toast.info(
                        "Confirming transaction..."
                    );

                    const confirmationResponse = await fetcher<TxConfirmData>(
                        "/api/tx/confirm",
                        {
                            method: "POST",
                            body: JSON.stringify({txSignature}),
                            headers: {
                                "Content-type": "application/json; charset=UTF-8",
                            },
                        }
                    );

                    if (confirmationResponse.confirmed) {
                        toast.promise(requestAPI({
                            "accept": "application/json",
                        }, 'POST', JSON.stringify({
                            name: name,
                            address: address,
                            tag: tag,
                            owner: owner,
                            telegram: telegram,
                            length: length,
                            channel: channel
                        }), "/api/trend/", true), {
                            pending: 'Submitting...',
                            success: 'Purchase successful. Your trending will start soon!',
                            error: 'Submission failed. Please contact @wif_professor for support.'
                        }).then(r => {
                            console.log(r);
                            setLoading(false);
                        }).catch(e => {
                            console.error(e);
                            toast.error("Submission failed. Please contact @wif_professor for support.");
                        });
                    } else {
                        toast.success("Error confirming transaction");
                    }
                } catch (error: any) {
                    setTxState("error");
                    toast.error("Error creating transaction");
                    setLoading(false);
                }
            }
        }

        void run();
    }


    return (
        <>
            {connected ? (
                <>
                {loading ? (
                        <div>
                            <div className={"flex justify-center"}>
                                <GridLoader />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className={"flex justify-center"}>
                                <WalletMultiButton className="btn" />
                            </div>

                            <div>
                                <br/>
                                <p className={"text-center"}>
                                    Purchase Trending on WIF Trending! After purchasing, you will be put into the queue.
                                    Others
                                    may be still running their time, so please be patient.
                                    <br/>

                                    <b>(Telegram ID is your unique user ID, not your username. You can find it in your
                                        settings.)</b>
                                    <br/>

                                    <b>If you have not had trending or buy bot set up, please message @wif_professor or
                                    @Winslowbankz on Telegram first to set up your token.</b>
                                </p>
                                <br/>
                                <span className="relative flex justify-center">
                          <div
                              className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-transparent bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-75"
                          ></div>

                          <span className="relative z-10 bg-white px-6">Purchase Trending Spot</span>
                        </span>
                                <br />


                                <form onSubmit={handleSubmit}>
                                    <h2 className={"text-center"}>Token Name</h2>
                                    <div>
                                        <label htmlFor="email" className="sr-only">Token Name</label>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                placeholder="ElonWifHat"
                                                required={true}
                                                onChange={(e) => setName(e.target.value)}
                                            />

                                            <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                      />
                                    </svg>
                                  </span>
                                        </div>
                                    </div>
                                    <br/>
                                    <h2 className={"text-center"}>Token Address</h2>
                                    <div>
                                        <label htmlFor="email" className="sr-only">Token Address</label>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                placeholder="DpDuHScSNi6LQZ9hjrwS2fjfgfeoAH1jRgcXt38rDrEw"
                                                required={true}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />

                                            <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                      />
                                    </svg>
                                  </span>
                                        </div>
                                    </div>
                                    <br/>
                                    <h2 className={"text-center"}>Token Ticker (no $)</h2>
                                    <div>
                                        <label htmlFor="text" className="sr-only">Token Ticker (no $)</label>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                placeholder="ELON"
                                                required={true}
                                                onChange={(e) => setTag(e.target.value)}
                                            />

                                            <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                      />
                                    </svg>
                                  </span>
                                        </div>
                                    </div>
                                    <br/>
                                    <h2 className={"text-center"}>Owner Address</h2>
                                    <div>
                                        <label htmlFor="email" className="sr-only">Owner Address</label>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                placeholder="DpDuHScSNi6LQZ9hjrwS2fjfgfeoAH1jRgcXt38rDrEw"
                                                required={true}
                                                onChange={(e) => setOwner(e.target.value)}
                                            />

                                            <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                      />
                                    </svg>
                                  </span>
                                        </div>
                                    </div>
                                    <br/>
                                    <h2 className={"text-center"}>Telegram ID</h2>
                                    <div>
                                        <label htmlFor="email" className="sr-only">Telegram ID</label>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                placeholder="-102847692"
                                                required={true}
                                                onChange={(e) => setTelegram(parseInt(e.target.value))}
                                            />

                                            <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                      />
                                    </svg>
                                  </span>
                                        </div>
                                    </div>
                                    <br/>
                                    <h2 className={"text-center"}>Telegram Channel</h2>
                                    <div>
                                        <label htmlFor="email" className="sr-only">Telegram Channel</label>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                placeholder="https://t.me/..."
                                                required={true}
                                                onChange={(e) => setChannel(e.target.value)}
                                            />

                                            <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                      />
                                    </svg>
                                  </span>
                                        </div>
                                    </div>
                                    <br/>
                                    <h2 className={"text-center"}>Length</h2>
                                    <div className={"flex justify-center"}>
                                        <label htmlFor="email" className="sr-only">Length of Trending</label>

                                        <div className="relative">
                                            <select onChange={(e) => {
                                                setLength(parseInt(e.target.value));
                                            }} className="select select-secondary w-full max-w-xs">
                                                <option disabled selected value={0}>How long do you want to trend?</option>
                                                <option value={1}>2 HRS (0.6 SOL)</option>
                                                <option value={2}>4 HRS (1 SOL)</option>
                                                <option value={3}>8 HRS (1.8 SOL)</option>
                                                <option value={4}>12 HRS (2.6 SOL)</option>
                                                <option value={5}>24 HRS (3.5 SOL)</option>
                                                <option value={6}>48 HRS (6 SOL)</option>
                                            </select>

                                            <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                      />
                                    </svg>
                                  </span>
                                        </div>
                                    </div>
                                    <br/>
                                    <button
                                        type="submit"
                                        className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
                                    >
                                        Submit
                                    </button>

                                </form>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className={"flex justify-center my-5"}>
                    <WalletMultiButton className="btn" />
                </div>
            )}
        </>
    )
}