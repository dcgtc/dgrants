const assert = require('assert')
const Web3 = require('web3')
const Payments = require('../build/Payments')

let web3 = new Web3(require('ganache-cli').provider())
let accounts

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    assert(accounts);
})

describe('Dapp Payments', () => {
    it ('Given Payment contract When pay then balance of contract increases the value of the payment', async () => {
        const owner = accounts[0]
        const payer = accounts[1]

        // Given
        const contract = await givenPaymentContract(owner)
        assert(contract.options.address, 'Contract not created')

        // When
        const initialBalance = await web3.eth.getBalance(contract.options.address)
        const amount = 10000
        const method = await contract.methods.pay('SC-9999', amount)
        estimateGas = await method.estimateGas()
        await method.send({
            from: payer,
            value: amount,
            gas: estimateGas*5
        })

        // Then
        assert.equal(await web3.eth.getBalance(contract.options.address), parseFloat(initialBalance) + amount)
        // And
        assert.equal(await contract.methods.paymentsOf(payer).call(), '1')
    })

    it ('Given Payment contract with funds When withdraw then funds to owner', async () => {
        const owner = accounts[0]
        const payer = accounts[1]

        // Given
        const contract = await givenPaymentContract(owner)
        assert(contract.options.address, 'Contract not created')
        // add funds to contract
        const amount = 10000
        let method = await contract.methods.pay('SC-9999', amount)
        let estimateGas = await method.estimateGas()
        await method.send({
            from: payer,
            value: amount,
            gas: estimateGas*5
        })

        // When
        const initialBalance = await web3.eth.getBalance(owner)
        const funds = await web3.eth.getBalance(contract.options.address)
        method = contract.methods.withdraw()
        estimateGas = await method.estimateGas()
        const receipt = await method.send({
            from: owner,
            gas: estimateGas*4
        })
        const gasUsed = receipt.gasUsed // Expected will be: initialBalance + funds - (gas consumed by withdraw transaction)
        const gasPrice = await web3.eth.getGasPrice()

        // Then
        assert.equal(await web3.eth.getBalance(owner), parseFloat(initialBalance) + parseFloat(funds) - parseFloat(gasUsed)*parseFloat(gasPrice) )
    })

    it('Given Payment contract with funds When someone different of owner withdraw then fails', async () => {
        const owner = accounts[0]
        const payer = accounts[1]
        const thief = accounts[2]

        // Given
        const contract = await givenPaymentContract(owner)
        assert(contract.options.address, 'Contract not created')
        // add funds to contract
        const amount = 10000
        let method = await contract.methods.pay('SC-9999', amount)
        let estimateGas = await method.estimateGas()
        await method.send({
            from: payer,
            value: amount,
            gas: estimateGas*5
        })

        // When
        let error
        try {
            method = contract.methods.withdraw()
            estimateGas = await method.estimateGas()
            await method.send({
                from: thief,
                gas: estimateGas*4
            })
        } catch (e) {
            error = e.message
        }

        // Then
        assert.ok(error.indexOf('Only owner can withdraw funds') > 0)
    })
})

// Helper functions
givenPaymentContract = async(creator) => {
    const deploy = await new web3.eth.Contract(JSON.parse(Payments.abi))
    .deploy(
        {
            args: [],
            data: Payments.bytecode
        })
    let estimatedGas = await deploy.estimateGas()
    const contract = await deploy.send({
            from: creator,
            gas: estimatedGas + 1000
        })

    return contract 
}