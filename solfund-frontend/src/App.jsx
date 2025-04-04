import React from "react";
import WalletConnect from "./components/WalletConnect";
import CreateCampaign from "./views/CreateCampaign";

function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Solfund</h1>
      <WalletConnect />
      <hr style={{ margin: "2rem 0" }} />
      <CreateCampaign />
    </div>
  );
}

export default App;