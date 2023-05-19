import React, { useState } from 'react';
import { ethers } from 'ethers';

const MintNFTForm = ({ contract }) => {
  const [eventId, setEventId] = useState('');
  const [price, setPrice] = useState('');
  const [splitsRecipients, setSplitsRecipients] = useState([]);
  const [splitsPercentages, setSplitsPercentages] = useState([]);
  const [primaryRoyaltyPercentage, setPrimaryRoyaltyPercentage] = useState(4);
  const [secondaryRoyaltyPercentage, setSecondaryRoyaltyPercentage] = useState(2);
  const [priceCap, setPriceCap] = useState('0.001');

  const handleMintTicket = async (e) => {
    e.preventDefault();
  
    try {
      const parsedPrice = ethers.utils.parseEther(price.toString());
      const parsedPrimaryRoyalty = ethers.utils.parseUnits(primaryRoyaltyPercentage.toString(), 1);
      const parsedSecondaryRoyalty = ethers.utils.parseUnits(secondaryRoyaltyPercentage.toString(), 1);
      const parsedPriceCap = ethers.utils.parseEther(priceCap.toString());
      const tx = await contract.mintTicket(
        eventId,
        parsedPrice,
        splitsRecipients,
        splitsPercentages,
        parsedPrimaryRoyalty,
        parsedSecondaryRoyalty,
        parsedPriceCap
      );
  
      // Wait for the transaction to be mined
      // await tx.wait();

      const receipt = await tx.wait();
      const events = receipt.events;

      // Find the "TicketMinted" event
      const ticketMintedEvent = events.find((event) => event.event === "TicketMinted");

      // Retrieve the ticketId from the event
      const ticketId = ticketMintedEvent.args.ticketId.toNumber();

      console.log("Minted ticket ID:", ticketId);
  
      console.log(tx);
      // Reset the form inputs
      setEventId('');
      setPrice('');
      setSplitsRecipients([]);
      setSplitsPercentages([]);
      setPrimaryRoyaltyPercentage('');
      setSecondaryRoyaltyPercentage('');
      setPriceCap('');
  
      // Handle successful minting
      console.log('Ticket minted successfully!');
    } catch (error) {
      // Handle error
      console.error('Failed to mint ticket:', error);
    }
  };
  

  return (
    <div>
      <h2>Mint Ticket</h2>
      <form onSubmit={handleMintTicket}>
        <label>
          Event ID:
          <input type="text" value={eventId} onChange={(e) => setEventId(e.target.value)} />
        </label>
        <br />
        <label>
          Price (ETH):
          <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <br />
        {/* Add input fields for splitsRecipients and splitsPercentages */}
        {/* Add input fields for primaryRoyaltyPercentage, secondaryRoyaltyPercentage, and priceCap */}
        <br />
        <button type="submit">Mint Ticket</button>
      </form>
    </div>
  );
};

export default MintNFTForm;
