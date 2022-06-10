import { ethers } from './ethers-5.2.esm.min.js'
import { abi, contractAddy } from "./constance.js"

const metamask = window.ethereum
const connetButton = document.querySelector("#connectButton")
const fundButton = document.querySelector("#fundButton")
const showBal = document.querySelector("#showBalance")
const withdrawAmount = document.querySelector("#withdraw")
fundButton.onclick = fund
connetButton.onclick = connect
showBal.onclick = getBalance
withdrawAmount.onclick = withdraw

async function connect() {
    if (typeof metamask !== "undefined") {
        try {
            await metamask.request({ method: "eth_requestAccounts" })
            connetButton.textContent = "Connected"
        } catch (error) {
            console.log(error)
        }
    } else {
        connetButton.textContent = "Please install MetaMask"
    }
}

async function fund(ethAmount) {
    console.log(`Funding ${ethAmount} ETH`);
    ethAmount = document.querySelector("#ethAmount").value
    try {
        //for connecting to the metamask wallet we are doing the below line
        await metamask.request({ method: "eth_requestAccounts" })

        //for funding we need 
        //provide / connection to the blockchain 
        //signer / wallet /someone with gas       
        //contract that we are interacting with 
        //ABI & Address
        const provider = new ethers.providers.Web3Provider(metamask)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddy, abi, signer)
        const tx = await contract.fund({ value: ethers.utils.parseEther(ethAmount) })
        //hey listen for this transaction to be mined   
        await listenForTransaction(tx, provider)
        console.log("Funded")
    } catch (error) {
        console.log(error)
    }
}

async function getBalance() {
    if (typeof metamask !== "undefined") {
        try {
            const provider = new ethers.providers.Web3Provider(metamask)
            const balance = await provider.getBalance(contractAddy)
            console.log(`Balance is ${ethers.utils.formatEther(balance)}`);
        } catch (error) {
            console.log(error)
        }
    } else {
        connetButton.textContent = "Please install MetaMask"
    }
}

function listenForTransaction(transactionResponse, provider) {
    console.log(`Transaction ${transactionResponse.hash} submitted`);
    //the reason we return a promise is we need to create a listener for the blockchain 
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(`completed with ${transactionReceipt.confirmations}`);
            resolve()
        })
    })
}

async function withdraw() {

    try {
        await metamask.request({ method: "eth_requestAccounts" })
        const provider = new ethers.providers.Web3Provider(metamask)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddy, abi, signer)
        const tx = await contract.cheaperWithdraw()
        await listenForTransaction(tx, provider)
        console.log("withdraw successful")
    } catch (error) {
        console.log(error)
    }
}