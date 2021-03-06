import detectEthereumProvider from '@metamask/detect-provider';
import { useEffect, useState, useCallback } from 'react';
import Web3 from 'web3';
import "./App.css";
import { loadContract } from './utils/loadContract';

function App() {
  const [web3API, setWeb3API] = useState({
    web3: null,
    isProviderLoaded: false,
    provider: null,
    contract: null
  })

  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [shouldReload, reload] = useState(false)

  const canConnectToContract = account && web3API.contract
  const reloadEffect = useCallback(() => reload(!shouldReload), [shouldReload])

  const setAccountListener = (provider) => {
    provider.on('accountsChanged', accounts => setAccount(accounts[0]))
    provider.on('chainChanged', _ => window.location.reload())
  }

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider()

      if (provider) {
        const contract = await loadContract('Faucet', provider)
        setAccountListener(provider)

        setWeb3API({
          web3: new Web3(provider),
          provider,
          contract,
          isProviderLoaded: true
        })
      } else {
        setWeb3API(prev => ({ ...prev, isProviderLoaded: true }))
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
  }, [web3API, web3API.contract, shouldReload, account])

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

  const addFunds = useCallback(async () => {
    const { contract, web3 } = web3API
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei('1', 'ether')
    })

    reloadEffect()
  }, [web3API, account, reloadEffect])

  const withdraw = async () => {
    const { contract, web3 } = web3API
    const amount = web3.utils.toWei('0.1', 'ether')
    await contract.withdraw(amount, {
      from: account
    })

    reloadEffect()
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
                : !web3API.provider
                  ? <>
                    <div className="notification is-warning is-small is-rounded">
                      Wallet is not detected! &nbsp;
                      <a target="_blank" href="https://docs.metamask.io" rel="noreferrer">
                        Install Metamask
                      </a>
                    </div>
                  </>

                  : <button
                    className="button is-small"
                    onClick={connectWallet}
                  >
                    Connect wallet
                  </button>
            }

          </div>
          {
            canConnectToContract && <>
              <div className="balance-view is-size-2 my-4">
                Current Balance: <strong>{balance}</strong> ETH
              </div>
              <button onClick={addFunds} className="button is-link mr-2">Donate 1 eth</button>
              <button
                className="button is-primary"
                onClick={withdraw}
              >
                Withdraw
              </button>
            </>
          }
        </div>
      </div>
    </>
  );
}

export default App;
