import detectEthereumProvider from '@metamask/detect-provider';
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import "./App.css";
import { loadContract } from './utils/loadContract';

function App() {
  const [web3API, setWeb3API] = useState({
    web3: null,
    provider: null,
    contract: null
  })

  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)


  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      const contract = await loadContract('Faucet', provider)

      if (provider) {
        setWeb3API({
          web3: new Web3(provider),
          provider,
          contract
        })
      } else {
        console.error("Please, install Metamask.")
      }
    }

    loadProvider()
  }, [])

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3API
      const balance = await web3.eth.getBalance(contract.address)
      setBalance(web3.utils.fromWei(balance, "ether"))
    }

    web3API.contract && loadBalance()
  }, [web3API, web3API.contract])

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3API.web3.eth.getAccounts()
      setAccount(accounts[0])
    }

    web3API.web3 && getAccount()
  }, [web3API.web3])

  const connectWallet = async () => {
    const accounts = await web3API.provider.request({
      method: 'eth_requestAccounts'
    })

    setAccount(accounts[0])
  }

  return (
    <>
      <div className="faucet-wrapper">
        <div className="faucet">
          <div className="is-flex is-align-items-center">
            <span className="mr-2">
              <strong>
                Account:
              </strong>
            </span>
            {
              account
                ? <span>{account}</span>
                : <button
                  className="button is-small"
                  onClick={connectWallet}
                >
                  Connect wallet
                </button>
            }
          </div>
          {
            account && <>
              <div className="balance-view is-size-2 my-4">
                Current Balance: <strong>{balance}</strong> ETH
              </div>
              <button className="button is-link mr-2">Donate</button>
              <button className="button is-primary">Withdraw</button>
            </>
          }
        </div>
      </div>
    </>
  );
}

export default App;
