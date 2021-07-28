import { Signer } from '@ethersproject/abstract-signer';
import { Contract } from 'ethers';
import { parseEther, parseUnits } from 'ethers/lib/utils';
import { task } from 'hardhat/config';

import { TASK_LOAD_ACCOUNTS } from './task-names';

export const fundAccount = async (hre: any, tokenAddress: string, amount: string, to: string) => {
  const tokenAbi = ['function transfer(address,uint256) returns (bool)', 'function decimals() view returns (uint8)'];

  // We impersonate the binance exchange account on mainnet as a source of tokens
  const funderAddress = '0x28C6c06298d514Db089934071355E5743bf21d60';
  await hre.network.provider.request({ method: 'hardhat_impersonateAccount', params: [funderAddress] });
  const signer = await hre.ethers.provider.getSigner(funderAddress);

  if (tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    // Transfer ETH from the funderAddress to the wallet
    await signer.sendTransaction({ to, value: parseEther(amount) });
  } else {
    // Transfer tokens from the funderAddress to the wallet
    const token = new Contract(tokenAddress, tokenAbi, signer);
    const decimals = await token.decimals();
    await token.transfer(to, parseUnits(amount, decimals));
  }

  // Stop impersonating the account since it's no longer needed
  await hre.network.provider.request({ method: 'hardhat_stopImpersonatingAccount', params: [funderAddress] });
};

task(TASK_LOAD_ACCOUNTS, 'Load accounts with ERC20 tokens', async (_taskArgs, hre) => {
  const accounts: Signer[] = await hre.ethers.getSigners();

  for (const account of accounts) {
    // get the current accounts address
    const address = await account.getAddress();
    // send GTC & DAI from binance to the hardhat accounts
    await fundAccount(hre, '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F', '10000', address); // GTC
    await fundAccount(hre, '0x6B175474E89094C44Da98b954EedeAC495271d0F', '10000', address); // DAI
    // log the action
    console.log(`\n${address} has been loaded with 10,000 GTC && 10,000 DAI\n`);
  }
});
