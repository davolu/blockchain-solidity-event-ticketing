import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Assuming you have already set up your contract instance and provider

const TicketList = ({ contract }) => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, [contract]);

  const fetchTickets = async () => {
    try {
      // Call the getAllTickets function from the smart contract
      const ticketIds = await contract.getAllTickets();

      // Update the state with the fetched ticket IDs
      setTickets(ticketIds);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };
  return (
    <div>
      <h2>All Tickets</h2>
      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <ul>
          {tickets.map((ticket, index) => (
            <li key={index}>
              Ticket ID: {ticket.ticketId}, Price: {ethers.utils.formatEther(ticket.price)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TicketList;
