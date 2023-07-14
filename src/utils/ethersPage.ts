import { ethers } from "ethers";

const { ethereum } = window;

const infuraURL = "https://polygon-bor.publicnode.com";
const provider = new ethers.providers.JsonRpcProvider(infuraURL);

const tokenAbi = [
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    type: "function",
  },
];

async function getTokensBalance(address: string, walletAddress: string) {
    const tokenContract = new ethers.Contract(address, tokenAbi, provider);
    const balance = await tokenContract.balanceOf(walletAddress);
    return balance.toString();
}

export default getTokensBalance;