import { BrowserProvider } from "ethers";
import { api } from "./api";

export async function loginWithMetaMask() {
  if (!window.ethereum) throw new Error("Chưa cài MetaMask");
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const { message } = await api.get(`/api/auth/nonce?address=${address}`);
  const signature = await signer.signMessage(message);
  return api.post("/api/auth/login", { address, signature });
}