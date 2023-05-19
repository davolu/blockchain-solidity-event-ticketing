import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import eventTicketContractABI from './ABIs/eventTicketContractABI.json';
import MintNFTForm from './MintNFTForm'; 
import { ethers } from 'ethers';
import SetTicketStateForm from './SetTicketStateForm';
import TicketList from './TicketList';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const App = () => {
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize Web3
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          window.web3 = new Web3(window.ethereum);
     
 
        } else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider);
        } else {
          throw new Error('No web3 provider detected');
        }

        // Load contract
        const web3 = window.web3;
        // const instance = new web3.eth.Contract(
        //   eventTicketContractABI,
        //  "0xaBCA6Cb1fD10E89EBbD10B655f65e9218e6DC274"
        // );
        const instance = new ethers.Contract("0xaBCA6Cb1fD10E89EBbD10B655f65e9218e6DC274", 
        eventTicketContractABI, signer);

        setContract(instance);
        console.log(`instance ${instance}`)
        // Load accounts
        const accs = await web3.eth.getAccounts();
        setAccounts(accs);
      } catch (error) {
        console.error('Error:', error);
      }
    }; 

    init();
  }, []);

 

  const handleBuyTicket = async () => {
    try {
      setLoading(true);
      setStatus('');

     let price = 0.001;
      const parsedPrice = ethers.utils.parseEther(price.toString());
      // await contract.buyTicket(ticketId).send({ from: accounts[0], value: parsedPrice });
      const tx = await contract.buyTicket(ticketId, {
        value: parsedPrice, // Pass the ticket price in wei
      });
      await tx.wait();


      setStatus(`Ticket purchased successfully`);
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error occurred while buying ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Event Ticket NFT</h1>
      <div>
        <h3>Mint Ticket</h3>
        <MintNFTForm contract={contract} signer={signer} />
      
      </div>
      <div>
        <h3>Buy Ticket</h3>
        <input
          type="text"
          placeholder="Enter Ticket ID"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
        />
        <button onClick={handleBuyTicket} disabled={loading}>
          Buy Ticket
        </button>
      </div>
      <div>{status}</div>
      <br/><br/>
      <SetTicketStateForm contract={contract} signer={signer} />

      <TicketList contract={contract} signer={signer}  />
      {/* <DeFiInterface /> */}


    </div>
  );
};

export default App;
