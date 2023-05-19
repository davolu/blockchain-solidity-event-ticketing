import React, { useState } from "react";
import { ethers } from "ethers";

const SetTicketStateForm = ({ contract }) => {
  const [stateKey, setStateKey] = useState("");
  const [value, setValue] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const handleSetTicketState = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const tx = await contract.setTicketState(ticketId, ethers.utils.formatBytes32String(stateKey), value);

      await tx.wait();
      console.log("Ticket state updated successfully");
    } catch (error) {
      console.error("Failed to update ticket state:", error);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSetTicketState}>
      <label>
        State Key:
        <input type="text" value={stateKey} onChange={(e) => setStateKey(e.target.value)} />
      </label>
      <label>
        Ticket ID:
        <input type="text" value={ticketId} onChange={(e) => setTicketId(e.target.value)} />
      </label>
      {/* <label>
        Value:
        <input type="checkbox" checked={value} onChange={(e) => setValue(e.target.checked)} />
      </label> */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Loading..." : "Set Ticket State"}
      </button>
    </form>
  );
};

export default SetTicketStateForm;
