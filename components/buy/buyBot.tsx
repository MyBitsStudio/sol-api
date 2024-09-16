import {MouseEventHandler, useState} from "react";
import {GridLoader} from "react-spinners";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {requestAPI} from "@/utils/api";


export function BuyBot(props: { toggle: MouseEventHandler<HTMLButtonElement> | undefined; }) {

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [tag, setTag] = useState('');
    const [owner, setOwner] = useState('');
    const [telegram, setTelegram] = useState(0);
    const [loading, setLoading] = useState(false);
    const [channel, setChannel] = useState('');
    const [url, setUrl] = useState('');

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
            toast.error("Telegram id should not include @");
            return false;
        }

        if(data.telegram.length <= 2){
            toast.error("Please enter a valid telegram username.");
            return false;
        }

        if(data.url.length <= 3){
            toast.error("Please enter a valid telegram channel link.");
            return false;
        }

        return true;

    }

    function handleSubmit(e: { preventDefault: () => void; }){
        e.preventDefault();
        console.log(name, address, tag);
        setLoading(true);

        if(name === '' || address === '' || tag === '' || owner === '' || telegram === 0){
            toast.error("Please fill out all fields");
            setLoading(false);
            return;
        }

        if(!verifyData({name: name, address: address, tag: tag, owner: owner, telegram: telegram, channel: channel})){
            setLoading(false);
            return;
        }


        toast.promise(requestAPI({
            "accept" : "application/json",
        }, 'POST', JSON.stringify({name: name, address: address, tag: tag, owner: owner, telegram: telegram, channel: channel, link: url}), "/api/buy/", true), {
            pending: 'Submitting...',
            success: 'Submission successful. You will receive a message on your telegram when approved.',
            error: 'Submission failed. Please try again later.'
        }).then(r => {
            console.log(r);
            setLoading(false);
        }).catch(e => {
            console.error(e);
            toast.error("Submission failed. Please try again later.");
            setLoading(false);
        });


    }

    return (
        <>
        {loading ? (
            <div>
                <div>
                    <GridLoader />
                </div>
            </div>
            ) : (
                <div>
                    <div>
                        <br/>
                        <p className={"text-center"}>
                            Request to be featured on our buying bot! Upon confirmation, your token buys
                            will be featured on the Buy Bot in WIF Trending. To request the Buy Bot to be added to your channel, please make sure to include
                            a valid channel id. You will get a message when it is finished on your telegram.
                            <br />
                            <b>(Telegram User ID is your unique user ID, not your username. You can find it in your settings.)</b>
                            <br />
                            <b>(Channel ID is the unique channel ID you wish the bot to be in, OPTIONAL)</b>
                        </p>
                        <br/>
                        <span className="relative flex justify-center">
                          <div
                              className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-transparent bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-75"
                          ></div>

                          <span className="relative z-10 bg-white px-6">Request Buy Bot</span>
                        </span>
                        <br/>
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
                            <h2 className={"text-center"}>Telegram User ID</h2>
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
                            <br />
                            <h2 className={"text-center"}>Telegram Channel Link</h2>
                            <div>
                                <label htmlFor="email" className="sr-only">Telegram Channel Link</label>

                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                        placeholder="https://t.me/..."
                                        required={true}
                                        onChange={(e) => setUrl(e.target.value)}
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
                            <h2 className={"text-center"}>Channel ID (optional)</h2>
                            <div>
                                <label htmlFor="email" className="sr-only">Channel ID Where Buy Bot will be at</label>

                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                        placeholder="-1029278346"
                                        required={false}
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
    )
}