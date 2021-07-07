import moment from 'moment';
import { GrantRegistry } from '../../dapp';
import Web3 from './web3';

class GrantService {
  getAllGrants = async function (address) {
    const web3 = await Web3();
    if (!web3) {
      return undefined;
    }

    let error;
    try {
      const contract = await new web3.eth.Contract(GrantRegistry.abi, address);
      console.log('Created contract');
      const grantCount = await contract.methods.getGrantCount().call();
      console.log('Grant count: %s', grantCount);
      debugger;
      const grants = await contract.methods.getAllGrants().call();
      console.log('Grants is:');
      console.log(grants);
      return grants;
    } catch (e) {
      error = e.message;
    }

    return error;
  }

  getAllGrantIds = async function (address) {
    console.log('TESTING THIS');
    const web3 = await Web3();
    if (!web3) {
      console.log('Failed to get web3 instance');
      return undefined;
    }
    console.log('Created web3');

    const contract = await new web3.eth.Contract(JSON.parse(GrantRegistry.abi), address);
    console.log('Created contract from ABI');
    const rawGrantIds = await contract.methods.getAllGrantIds().call();
    console.log('HERE WE GO');
    console.log(rawGrantIds);
    var grantIds;

    rawGrantIds.forEach((grantId, index) => {
      grantIds[index] = web3.utils.hexToAscii(grantId)
    })

    return grantIds;
  }


    createContract = async function () {
      const web3 = await Web3();
      if (!web3) {
        return undefined;
      }

      const accounts = await web3.eth.getAccounts();
      const contract = await new web3.eth.Contract(JSON.parse(GrantRegistry.abi))
        .deploy({ data: GrantRegistry.bytecode })
        .send({ from: accounts[0] });
      return contract;
    }

    getBalance = async function (address, unit) {
      const web3 = await Web3();
      if (!web3) {
        return undefined;
      }
      const balance = await web3.eth.getBalance(address);

      return web3.utils.fromWei(balance, unit);
    }

    pay = async function (address, reference, amount) {
      const web3 = await Web3();
      if (!web3) {
        return undefined;
      }

      let error;
      try {
        const accounts = await web3.eth.getAccounts();
        const contract = await new web3.eth.Contract(JSON.parse(GrantRegistry.abi), address);
        const value = web3.utils.toWei(String(amount), 'ether');
        await contract.methods.pay(reference, value).send({ from: accounts[0], value });
      } catch (e) {
        error = e.message;
      }

      return error;
    }

    withdraw = async function (address) {
      const web3 = await Web3();
      if (!web3) {
        return undefined;
      }

      let error;
      try {
        const accounts = await web3.eth.getAccounts();
        const contract = await new web3.eth.Contract(JSON.parse(GrantRegistry.abi), address);
        await contract.methods.withdraw().send({ from: accounts[0] });
      } catch (e) {
        error = e.message;
      }

      return error;
    }

    getPaymentsOfAccount = async function (address, account, unit) {
      const web3 = await Web3();
      if (!web3) {
        return undefined;
      }

      const contract = await new web3.eth.Contract(JSON.parse(GrantRegistry.abi), address);
      const count = await contract.methods.paymentsOf(account).call();
      const payments = await Promise.all(
        Array(parseInt(count))
          .fill()
          .map(async (el, index) => {
            const payment = await contract.methods.paymentOfAt(account, index).call();
            const amount = (!payment[1]) ? '' : web3.utils.fromWei(payment[1], unit);
            const date = (!payment[2]) ? '' : moment(payment[2], 'X').format('YYYY-MM-DDTHH:mm:ss');
            return {
              reference: payment[0],
              amount,
              date,
            };
          }),
      );
      return payments;
    }

    getNetwork = async function () {
      const web3 = await Web3();
      if (!web3) {
        return undefined;
      }
      const network = web3.currentProvider.networkVersion;
      switch (network) {
        case '1':
          return 'Mainnet';
        case '2':
          return 'Morden';
        case '3':
          return 'Ropsten';
        case '4':
          return 'Rinkeby';
        case '42':
          return 'Kovan';
        default:
          return 'Unknown';
      }
    }

    getLoggedAccount = async function () {
      const web3 = await Web3();
      if (!web3) {
        return undefined;
      }
      const accounts = await web3.eth.getAccounts();

      return (accounts && accounts.length > 0) ? accounts[0] : undefined;
    }
}

export default GrantService;
