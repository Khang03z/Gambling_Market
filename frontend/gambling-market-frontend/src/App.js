import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./contract";

function App() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [contract, setContract] = useState();
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [contractBalance, setContractBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [events, setEvents] = useState([]);

  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [tempBetAmount, setTempBetAmount] = useState("");
  const [tempBetChoice, setTempBetChoice] = useState(true);

  const connectWallet = async () => {
    if (window.ethereum) {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _account = await _signer.getAddress();
      const _contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _signer);

      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);
      setContract(_contract);
    } else {
      alert("MetaMask not detected");
    }
  };

  const deposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const tx = await contract.deposit({ value: ethers.parseEther(amount) });
      await tx.wait();
      alert("Deposit successful!");
      fetchBalances();
    } catch (error) {
      console.error("Error depositing:", error);
      alert("Deposit failed.");
    }
  };

  const withdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const tx = await contract.withdraw(ethers.parseEther(amount));
      await tx.wait();
      alert("Withdraw successful!");
      fetchBalances();
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Withdraw failed.");
    }
  };

  const placeBet = async () => {
    if (!selectedEventId || tempBetChoice === null || !tempBetAmount || parseFloat(tempBetAmount) <= 0) {
      alert("Please enter valid event, choice, and amount.");
      return;
    }

    try {
      const tx = await contract.placeBet(
        selectedEventId,
        tempBetChoice,
        ethers.parseEther(tempBetAmount)
      );
      await tx.wait();
      alert("Bet placed successfully!");
      fetchBalances();
      setSelectedEventId(null);
      setTempBetAmount("");
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("Bet placement failed.");
    }
  };

  const fetchBalances = async () => {
    if (!contract || !account) return;
    const userBal = await contract.getUserBalance(account);
    const contractBal = await contract.getContractBalance();

    setBalance(ethers.formatEther(userBal));
    setContractBalance(ethers.formatEther(contractBal));
  };

  const fetchEventsList = async () => {
    if (!contract) return;

    try {
      const eventCount = await contract.nextEventId();
      const eventsList = [];
      for (let i = 1; i < eventCount; i++) {
        const event = await contract.getEventBasic(i);
        eventsList.push({ id: i, description: event[0], active: event[5] });
      }

      setEvents(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    if (contract && account) {
      fetchBalances();
      fetchEventsList();
    }
  }, [contract, account]);

  return (
    <div style={{ padding: "40px", fontFamily: "'Inter', sans-serif", backgroundColor: "#121212", color: "#e0e0e0", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#ffffff", marginBottom: "30px", fontSize: "32px" }}>
        🪙 Gambling Market DApp
      </h1>

      {!account ? (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={connectWallet}
            style={{
              padding: "12px 24px",
              fontSize: "18px",
              backgroundColor: "#00bcd4",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 10px rgba(0, 188, 212, 0.3)"
            }}>
            🔌 Kết nối MetaMask
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "#1e1e1e", padding: "30px", borderRadius: "12px", boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)" }}>
          <p><strong>Ví:</strong> {account}</p>
          <p><strong>Số dư của bạn (trong contract):</strong> {balance} ETH</p>
          <p><strong>Tổng quỹ contract:</strong> {contractBalance} ETH</p>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="number"
              placeholder="Nhập số ETH"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                marginBottom: "15px",
                borderRadius: "8px",
                border: "1px solid #444",
                fontSize: "16px",
                color: "#fff",
                backgroundColor: "#2c2c2c"
              }}
              step="any"
              min="0"
            />
            <button
              onClick={deposit}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                marginBottom: "10px",
                transition: "background-color 0.3s"
              }}>
              💰 Nạp vào
            </button>
            <button
              onClick={withdraw}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#f44336",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                transition: "background-color 0.3s"
              }}>
              💸 Rút ra
            </button>
          </div>

          <h3 style={{ color: "#ffffff", marginBottom: "15px" }}>📋 Danh sách các sự kiện:</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {events.map((event) => (
              <div
                key={event.id}
                onMouseEnter={() => setHoveredEventId(event.id)}
                onMouseLeave={() => setHoveredEventId(null)}
                style={{
                  backgroundColor: "#2a2a2a",
                  padding: "15px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                  position: "relative"
                }}
              >
                <h4 style={{ color: "#00bcd4" }}><strong>Event ID:</strong> {event.id}</h4>
                <p style={{ color: "#ccc" }}><strong>Miêu tả:</strong> {event.description}</p>
                <p style={{ color: event.active ? "#4CAF50" : "#f44336" }}>
                  <strong>Status:</strong> {event.active ? "Active" : "Inactive"}
                </p>

                {event.active && hoveredEventId === event.id && selectedEventId !== event.id && (
                  <button
                    onClick={() => {
                      setSelectedEventId(event.id);
                      setTempBetAmount("");
                      setTempBetChoice(true);
                    }}
                    style={{
                      position: "absolute",
                      bottom: "15px",
                      right: "15px",
                      backgroundColor: "#4CAF50",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    Đặt cược
                  </button>
                )}

                {selectedEventId === event.id && (
                  <div style={{ marginTop: "10px" }}>
                    <input
                      type="number"
                      placeholder="Số tiền cược"
                      value={tempBetAmount}
                      onChange={(e) => setTempBetAmount(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: "10px",
                        borderRadius: "6px",
                        border: "1px solid #555",
                        backgroundColor: "#1e1e1e",
                        color: "#fff"
                      }}
                    />
                    <div style={{ marginBottom: "10px", color: "#fff" }}>
                      <label style={{ marginRight: "10px" }}>
                        <input
                          type="radio"
                          value="true"
                          checked={tempBetChoice === true}
                          onChange={() => setTempBetChoice(true)}
                          style={{ marginRight: "5px" }}
                        />
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="false"
                          checked={tempBetChoice === false}
                          onChange={() => setTempBetChoice(false)}
                          style={{ marginRight: "5px" }}
                        />
                        No
                      </label>
                    </div>
                    <button
                      onClick={placeBet}
                      style={{
                        backgroundColor: "#2196F3",
                        color: "#fff",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      Xác nhận đặt cược
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
