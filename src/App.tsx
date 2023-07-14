import { useEffect, useState } from "react";
import { ethers } from "ethers";
import getTokensBalance from "./utils/ethersPage";
import { chains } from "./constants/chains";
import axios from "axios";
import truncateEthAddress from "truncate-eth-address";

function App() {
  const [haveMetamask, setHaveMetamask] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [accountBalance, setAccountBalance] = useState<string>();
  const [network, setNetwork] = useState();
  const [tokenBalances, setTokenBalances] = useState({});
  const [rpcUrl, setRpcUrl] = useState("");
  const [nativeTokenAddress, setNativeTokenAddress] = useState("");
  // const [provider, setProvider] = useState<any>();
  const [chainTokens, setChainTokens] = useState([]);
  const [tokensWithBalance, SetTokensWithBalance] = useState([]);
  const [chainName, setChainName] = useState("");

  const { ethereum } = window;
  const infuraURL = "https://polygon-bor.publicnode.com";
  const provider = new ethers.providers.JsonRpcProvider(infuraURL);

  useEffect(() => {
    const checkMetamaskAvailability = () => {
      if (!ethereum) {
        setHaveMetamask(false);
        alert("Please add Metamask to chrome");
      } else {
        setHaveMetamask(true);
      }
    };

    checkMetamaskAvailability();
  }, []);

  const connectWallet = async () => {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      let balance = await provider?.getBalance(accounts[0]);
      let balFormat = await ethers.utils.formatEther(balance);
      setWalletAddress(accounts[0]);
      setAccountBalance(balFormat);
      setIsConnected(true);
      setNetwork(ethereum.networkVersion);
    } catch (error) {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    let allChains: any = chains[0];
    for (const key in allChains) {
      if (allChains?.hasOwnProperty(key)) {
        const chainData = allChains[key];
        if (chainData?.chainID === network) {
          setChainName(chainData?.chainName)
        }
      }
    }

    network &&
      axios
        .get(`http://127.0.0.1:3000/api/v1/tokens/${network}`)
        .then((response) => {
          setChainTokens(response.data);
        })
        .catch((e) => {
          console.log("ERROR", e);
        });
  }, [network]);

  useEffect(() => {
    let newTokensList: any = [];
    chainTokens?.map(async (token: any) => {
      const balances = await getTokensBalance(token?.address, walletAddress);
      const newTokenWithBalance = [{ ...token, tokenBalance: balances }];
      console.log("TOKENS", newTokenWithBalance);
      newTokensList.push(newTokenWithBalance);
    });

    // stopped till here, merge the balances and tokens
    SetTokensWithBalance((prevState) => ({
      ...prevState,
      newTokensList,
    }));
  }, [chainTokens]);

  useEffect(() => {
    console.log("TOKENS WITH BALANCE", tokensWithBalance);
  }, [tokensWithBalance]);

  return (
    <div className="p-10">
      {isConnected ? (
        <h1 className="text-xl text-center mt-3">Wallet is Connected to {`${chainName}`} chain</h1>
      ) : (
        <>
          <button
            className="border border-gray-700 px-3 py-2 rounded-md w-auto block mx-auto my-0 font-semibold"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
          <h1 className="text-xl text-center mt-3">
            Please Connect the Wallet
          </h1>
        </>
      )}
      {isConnected && (
        <>
          <div className="w-full mt-10">
            <div className="flex items-center justify-center mt-5">
              <h3 className="mx-10">
                Wallet Address: {truncateEthAddress(walletAddress)}
              </h3>
              <h3 className="mx-10">Account Balance: {accountBalance}</h3>
              <h3 className="mx-10">Chain ID / Network: {network}</h3>
            </div>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-6 border border-gray-500">
              <div className="col-span-2 p-3 font-semibold">Name</div>
              <div className="col-span-1 p-3 font-semibold">Symbol</div>
              <div className="col-span-1 p-3 font-semibold">Address</div>
              <div className="col-span-1 p-3 font-semibold">Decimals</div>
              <div className="col-span-1 p-3 font-semibold">Balance</div>
            </div>
            {chainTokens?.map((token: any, idx: number) => {
              return (
                <div
                  className="grid grid-cols-6 border border-gray-500"
                  key={idx}
                >
                  <div className="flex items-center col-span-2 p-3">
                    <img
                      src={token.logoURI}
                      alt="token"
                      className="w-10 h-10 p-1 border border-slate-400 rounded-full mr-3"
                    />
                    <div>{token?.name}</div>
                  </div>
                  <div className="col-span-1 p-3">{token?.symbol}</div>
                  <div className="col-span-1 p-3">
                    {truncateEthAddress(token?.address)}
                  </div>
                  <div className="col-span-1 p-3">{token?.decimals}</div>
                  <div className="col-span-1 p-3"></div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
