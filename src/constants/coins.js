import * as chains from './chains';

const DOGECHAINCoins = [
  {
    name: "Doge",
    abbr: "DOGE",
    address: "", // eth address is fetched from the router
  },
  {
    name: 'DogeCoin',
    abbr: "DC",
    address: '0x7B4328c127B85369D9f82ca0503B000D09CF9180',
  },
  {
    name: "Grimace",
    abbr: "Grimace",
    address: "0x2f90907fD1DC1B7a484b6f31Ddf012328c2baB28",
  },
]

const COINS = new Map();
COINS.set(chains.ChainId.DOGECHAIN, DOGECHAINCoins)
export default COINS
