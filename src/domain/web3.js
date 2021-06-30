import Web3 from 'web3'

export default async () => {
    let web3

    if (typeof window !== 'undefined' && typeof window.ethereum != 'undefined') {
        
        try {
            // Request account access
            await window.ethereum.enable()
            // We are in the browser and web3 provider has been injected (probably by Metamask)    
            // Issue: https://github.com/ethereum/web3.js/issues/2640
            // Use transactionConfirmationBlocks
            web3 = new Web3(window.ethereum, null, {transactionConfirmationBlocks: 1})
        } catch (error) {
            alert('Please, allow Metamask access to your account')
            
        }
    } else if (typeof window !== 'undefined' && typeof window.web3 != 'undefined') {
        // Legacy purpose. Web3.provider is injected in window.ethereum 
        web3 = new Web3(window.web3.currentProvider);
    } else {
        alert("Please, install metamask")
    }
    return web3
 }