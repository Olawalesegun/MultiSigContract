import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const arrOfSigners = ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
  "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
]
const numberOfQuorum = 3;

const MultiSigModule = buildModule("MultisigModule", (m) => {
  const multiSig = m.contract("Multisig", [numberOfQuorum, arrOfSigners]);

  return { multiSig };
});

export default MultiSigModule;
