import React, { useEffect, useState } from "react";
import { BigNumber } from "bignumber.js";
import {
  Container,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Typography,
  Button,
} from "@material-ui/core";
import SwapVert from "@material-ui/icons/ArrowDownward";
import { useSnackbar } from "notistack";
import LoopIcon from "@material-ui/icons/Loop";
import {
  getAmountOut,
  getBalanceAndSymbol,
  swapTokens,
  getReserves,
  getAllowance,
  approveToken,
} from "../ethereumFunctions";
import CoinField from "./CoinField";
import CoinDialog from "./CoinDialog";
import LoadingButton from "../Components/LoadingButton";
import WrongNetwork from "../Components/wrongNetwork";
import { dogechainRouter } from "../constants/chains";

const styles = (theme) => ({
  allContainer: {
    alignItems: "center",
    padding: "0 20px",
    maxWidth: "1400px",
    margin: "0 auto",
    justifyContent: "center",
  },
  mainContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",

    [theme.breakpoints.down("md")]: {
      flexDirection: "column-reverse",
    },
  },
  graph: {
    margin: "0 auto",
    border: "2px solid rgba(113, 83, 217, 1)",
    borderRadius: theme.spacing(2),
    maxWidth: "90vw",
  },
  paperContainer: {
    backgroundColor: "#2F2A70",
    borderRadius: theme.spacing(2),
    border: "2px solid rgba(113, 83, 217, 1)",
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    color: "white",
    [theme.breakpoints.down("md")]: {
      marginBottom: "100px",
    },
  },
  switchButton: {
    zIndex: 1,
    margin: "-16px",
    backgroundColor: "rgba(113, 83, 217, 1)",
    width: "48px",
    height: "48px",
    padding: theme.spacing(0.5),
    borderRadius: "16px",
    border: "3px solid rgba(26, 25, 40, 1)",
    "&:hover": {
      backgroundColor: "#7153D9",
      color: "black",
    },
  },
  fullWidth: {
    width: "100%",
  },
  title: {
    textAlign: "center",
    padding: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },
  hr: {
    width: "100%",
  },
  balance: {
    padding: theme.spacing(1),
    overflow: "wrap",
    textAlign: "center",
  },
  footer: {
    [theme.breakpoints.down("md")]: {
      marginTop: "100px",
      marginBottom: "100px",
    },
    marginTop: "285px",
  },
  btnswap: {
    fontSize: "30px",
    color: "#FFFFFF",
  },
});

const useStyles = makeStyles(styles);

function CoinSwapper(props) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [approveIsRequired, setApproveRequired] = useState(false);
  const [priceImpact, setPriceImpact] = useState("0");

  // Stores a record of whether their respective dialog window is open
  const [dialog1Open, setDialog1Open] = React.useState(false);
  const [dialog2Open, setDialog2Open] = React.useState(false);
  const [wrongNetworkOpen] = React.useState(false);

  // Stores data about their respective coin
  const [coin1, setCoin1] = React.useState({
    address: undefined,
    symbol: undefined,
    balance: undefined,
  });
  const [coin2, setCoin2] = React.useState({
    address: undefined,
    symbol: undefined,
    balance: undefined,
  });

  // Stores the current reserves in the liquidity pool between coin1 and coin2
  const [reserves, setReserves] = React.useState(["0.0", "0.0"]);

  // Stores the current value of their respective text box
  const [field1Value, setField1Value] = React.useState("");
  const [field2Value, setField2Value] = React.useState("");

  // Controls the loading button
  const [loading, setLoading] = React.useState(false);

  // Switches the top and bottom coins, this is called when users hit the swap button or select the opposite
  // token in the dialog (e.g. if coin1 is TokenA and the user selects TokenB when choosing coin2)
  const switchFields = () => {
    setCoin1(coin2);
    setCoin2(coin1);
    setField1Value(field2Value);
    setReserves(reserves.reverse());
  };

  // These functions take an HTML event, pull the data out and puts it into a state variable.
  const handleChange = {
    field1: (e) => {
      setField1Value(e.target.value);
    },
  };

  // Turns the account's balance into something nice and readable
  const formatBalance = (balance, symbol) => {
    if (balance && symbol)
      return parseFloat(balance).toPrecision(8) + " " + symbol;
    else return "0.0";
  };

  // Turns the coin's reserves into something nice and readable
  const formatReserve = (reserve, symbol) => {
    if (reserve && symbol) return reserve + " " + symbol;
    else return "0.0";
  };

  // Determines whether the button should be enabled or not
  const isButtonEnabled = () => {
    if (approveIsRequired) return true;

    // If both coins have been selected, and a valid float has been entered which is less than the user's balance, then return true
    const parsedInput1 = parseFloat(field1Value);
    const parsedInput2 = parseFloat(field2Value);
    return (
      coin1.address &&
      coin2.address &&
      !isNaN(parsedInput1) &&
      !isNaN(parsedInput2) &&
      0 < parsedInput1 &&
      parsedInput1 <= coin1.balance
    );
  };

  // Called when the dialog window for coin1 exits
  const onToken1Selected = (address) => {
    // Close the dialog window
    setDialog1Open(false);

    // If the user inputs the same token, we want to switch the data in the fields
    if (address === coin2.address) {
      switchFields();
    }
    // We only update the values if the user provides a token
    else if (address) {
      setCoin1((coin) => {
        return {
          ...coin,
          address,
        };
      });
    }
  };

  useEffect(() => {
    if (!coin1.address) return;

    //when coin1.address changed: fetch balances, symbol, allowance, etc.
    getBalanceAndSymbol(
      props.network.account,
      coin1.address,
      props.network.provider,
      props.network.signer,
      props.network.weth.address,
      props.network.coins
    ).then((data) => {
      setCoin1((coin) => {
        return {
          ...coin,
          symbol: data.symbol,
          balance: data.balance,
        };
      });

      if (props.network.weth.address !== coin1.address) {
        getAllowance(
          coin1.address,
          props.network.account,
          dogechainRouter,
          props.network.signer
        ).then((allowance) => {
          if (!allowance) return;

          console.log(
            `Allowance for token: ${
              data.symbol
            } checked, allowed: ${!allowance.lt(data.balanceRaw)}`
          );

          setApproveRequired(allowance.lt(data.balanceRaw));
        });
      }
    });
  }, [
    coin1.address,
    props.network.account,
    props.network.provider,
    props.network.signer,
    props.network.weth.address,
    props.network.coins,
  ]);

  // Called when the dialog window for coin2 exits
  const onToken2Selected = (address) => {
    // Close the dialog window
    setDialog2Open(false);

    // If the user inputs the same token, we want to switch the data in the fields
    if (address === coin1.address) {
      switchFields();
    }
    // We only update the values if the user provides a token
    else if (address) {
      // Getting some token data is async, so we need to wait for the data to return, hence the promise
      getBalanceAndSymbol(
        props.network.account,
        address,
        props.network.provider,
        props.network.signer,
        props.network.weth.address,
        props.network.coins
      ).then((data) => {
        setCoin2({
          address: address,
          symbol: data.symbol,
          balance: data.balance,
        });
      });
    }
  };

  // Calls the swapTokens Ethereum function to make the swap, then resets nessicary state variables
  const swap = () => {
    console.log("Attempting to swap tokens...");
    setLoading(true);

    if (approveIsRequired) {
      return approveToken(coin1.address, dogechainRouter, props.network.signer)
        .then(() => {
          setLoading(false);
          setApproveRequired(false);
          enqueueSnackbar("Approved", { variant: "success" });
        })
        .catch((e) => {
          setLoading(false);
          enqueueSnackbar("Approve Failed (" + e.message + ")", {
            variant: "error",
            autoHideDuration: 10000,
          });
        });
    }

    swapTokens(
      coin1.address,
      coin2.address,
      field1Value,
      props.network.router,
      props.network.account,
      props.network.signer
    )
      .then(() => {
        setLoading(false);

        // If the transaction was successful, we clear to input to make sure the user doesn't accidental redo the transfer
        setField1Value("");
        enqueueSnackbar("Transaction Successful", { variant: "success" });
      })
      .catch((e) => {
        setLoading(false);
        enqueueSnackbar("Transaction Failed (" + e.message + ")", {
          variant: "error",
          autoHideDuration: 10000,
        });
      });
  };

  // The lambdas within these useEffects will be called when a particular dependency is updated. These dependencies
  // are defined in the array of variables passed to the function after the lambda expression. If there are no dependencies
  // the lambda will only ever be called when the component mounts. These are very useful for calculating new values
  // after a particular state change, for example, calculating the new exchange rate whenever the addresses
  // of the two coins change.

  // This hook is called when either of the state variables `coin1.address` or `coin2.address` change.
  // This means that when the user selects a different coin to convert between, or the coins are swapped,
  // the new reserves will be calculated.
  useEffect(() => {
    console.log(
      "Trying to get Reserves between:\n" + coin1.address + "\n" + coin2.address
    );

    if (coin1.address && coin2.address) {
      getReserves(
        coin1.address,
        coin2.address,
        props.network.factory,
        props.network.signer,
        props.network.account
      ).then((data) => setReserves(data));
    }
  }, [
    coin1.address,
    coin2.address,
    props.network.account,
    props.network.factory,
    props.network.router,
    props.network.signer,
  ]);

  //Calculate price impact
  useEffect(() => {
    const poolOut = new BigNumber(reserves[1]);
    const amountOut = new BigNumber(field2Value);

    const poolOutAfter = poolOut.minus(amountOut);
    const poolOutDifferent = poolOut.minus(poolOutAfter);
    const priceImpact = poolOutDifferent.div(poolOut).times(100);

    if (isNaN(priceImpact.toString())) {
      setPriceImpact("< 0.1");
    } else if (priceImpact.lt("0.1")) {
      setPriceImpact("< 0.1");
    } else if (priceImpact.gt("99")) {
      setPriceImpact("> 99");
    } else {
      setPriceImpact(priceImpact.toString().slice(0, 4));
    }
  }, [field2Value, reserves[1]]);

  // This hook is called when either of the state variables `field1Value` `coin1.address` or `coin2.address` change.
  // It attempts to calculate and set the state variable `field2Value`
  // This means that if the user types a new value into the conversion box or the conversion rate changes,
  // the value in the output box will change.
  useEffect(() => {
    if (isNaN(parseFloat(field1Value))) {
      setField2Value("");
    } else if (parseFloat(field1Value) && coin1.address && coin2.address) {
      getAmountOut(
        coin1.address,
        coin2.address,
        field1Value,
        props.network.router,
        props.network.signer
      )
        .then((amount) => setField2Value(amount.toFixed(7)))
        .catch((e) => {
          console.log(e);
          setField2Value("NA");
        });
    } else {
      setField2Value("");
    }
  }, [field1Value, coin1.address, coin2.address]);

  // This hook creates a timeout that will run every ~10 seconds, it's role is to check if the user's balance has
  // updated has changed. This allows them to see when a transaction completes by looking at the balance output.
  useEffect(() => {
    const coinTimeout = setTimeout(() => {
      console.log("props: ", props);
      console.log("Checking balances...");

      if (coin1.address && coin2.address && props.network.account) {
        getReserves(
          coin1.address,
          coin2.address,
          props.network.factory,
          props.network.signer,
          props.network.account
        ).then((data) => setReserves(data));
      }

      if (coin1.address && props.network.account && !wrongNetworkOpen) {
        getBalanceAndSymbol(
          props.network.account,
          coin1.address,
          props.network.provider,
          props.network.signer,
          props.network.weth.address,
          props.network.coins
        ).then((data) => {
          setCoin1({
            ...coin1,
            balance: data.balance,
          });
        });
      }
      if (coin2.address && props.network.account && !wrongNetworkOpen) {
        getBalanceAndSymbol(
          props.network.account,
          coin2.address,
          props.network.provider,
          props.network.signer,
          props.network.weth.address,
          props.network.coins
        ).then((data) => {
          setCoin2({
            ...coin2,
            balance: data.balance,
          });
        });
      }
    }, 10000);

    return () => clearTimeout(coinTimeout);
  });

  return (
    <div className={classes.allContainer}>
      {/* Dialog Windows */}
      <CoinDialog
        open={dialog1Open}
        onClose={onToken1Selected}
        coins={props.network.coins}
        props={props.network.signer}
      />
      <CoinDialog
        open={dialog2Open}
        onClose={onToken2Selected}
        coins={props.network.coins}
        signer={props.network.signer}
      />
      <WrongNetwork open={wrongNetworkOpen} />

      {/* Coin Swapper */}
      <div className={classes.mainContainer}>
        <iframe
          src="https://dexscreener.com/dogechain/0x1aAD352a2190B399Bb3cfD4d5E4B0bf6EFA33C0e?embed=1&theme=dark&trades=0&info=0"
          title="MyFrame"
          width="780px"
          height="650px"
          className={classes.graph}
        ></iframe>
        <Container maxWidth="xs" className={classes.swapContainer}>
          <Paper className={classes.paperContainer}>
            <Grid
              container
              spacing={12}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h5" className={classes.title}>
                Swap
              </Typography>
              <button item md={12} xs={2} className="btnswap">
                Slippage: 10%
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M14.6271 9C14.6271 9.255 14.6046 9.495 14.5746 9.735L16.1571 10.9725C16.2996 11.085 16.3371 11.2875 16.2471 11.4525L14.7471 14.0475C14.6796 14.1675 14.5521 14.235 14.4246 14.235C14.3796 14.235 14.3346 14.2275 14.2896 14.2125L12.4221 13.4625C12.0321 13.755 11.6121 14.01 11.1546 14.1975L10.8696 16.185C10.8471 16.365 10.6896 16.5 10.5021 16.5H7.50208C7.31458 16.5 7.15708 16.365 7.13458 16.185L6.84958 14.1975C6.39208 14.01 5.97208 13.7625 5.58208 13.4625L3.71458 14.2125C3.67708 14.2275 3.63208 14.235 3.58708 14.235C3.45208 14.235 3.32458 14.1675 3.25708 14.0475L1.75708 11.4525C1.66708 11.2875 1.70458 11.085 1.84708 10.9725L3.42958 9.735C3.39958 9.495 3.37708 9.2475 3.37708 9C3.37708 8.7525 3.39958 8.505 3.42958 8.265L1.84708 7.0275C1.70458 6.915 1.65958 6.7125 1.75708 6.5475L3.25708 3.9525C3.32458 3.8325 3.45208 3.765 3.57958 3.765C3.62458 3.765 3.66958 3.7725 3.71458 3.7875L5.58208 4.5375C5.97208 4.245 6.39208 3.99 6.84958 3.8025L7.13458 1.815C7.15708 1.635 7.31458 1.5 7.50208 1.5H10.5021C10.6896 1.5 10.8471 1.635 10.8696 1.815L11.1546 3.8025C11.6121 3.99 12.0321 4.2375 12.4221 4.5375L14.2896 3.7875C14.3271 3.7725 14.3721 3.765 14.4171 3.765C14.5521 3.765 14.6796 3.8325 14.7471 3.9525L16.2471 6.5475C16.3371 6.7125 16.2996 6.915 16.1571 7.0275L14.5746 8.265C14.6046 8.505 14.6271 8.745 14.6271 9ZM13.1271 9C13.1271 8.8425 13.1196 8.685 13.0896 8.4525L12.9846 7.605L13.6521 7.08L14.4546 6.4425L13.9296 5.535L12.9771 5.9175L12.1821 6.24L11.4996 5.715C11.1996 5.49 10.8996 5.3175 10.5771 5.1825L9.78208 4.86L9.66208 4.0125L9.51958 3H8.47708L8.32708 4.0125L8.20708 4.86L7.41208 5.1825C7.10458 5.31 6.79708 5.49 6.47458 5.73L5.79958 6.24L5.01958 5.925L4.06708 5.5425L3.54208 6.45L4.35208 7.08L5.01958 7.605L4.91458 8.4525C4.89208 8.6775 4.87708 8.85 4.87708 9C4.87708 9.15 4.89208 9.3225 4.91458 9.555L5.01958 10.4025L4.35208 10.9275L3.54208 11.5575L4.06708 12.465L5.01958 12.0825L5.81458 11.76L6.49708 12.285C6.79708 12.51 7.09708 12.6825 7.41958 12.8175L8.21458 13.14L8.33458 13.9875L8.47708 15H9.52708L9.67708 13.9875L9.79708 13.14L10.5921 12.8175C10.8996 12.69 11.2071 12.51 11.5296 12.27L12.2046 11.76L12.9846 12.075L13.9371 12.4575L14.4621 11.55L13.6521 10.92L12.9846 10.395L13.0896 9.5475C13.1121 9.3225 13.1271 9.1575 13.1271 9ZM9.00208 6C7.34458 6 6.00208 7.3425 6.00208 9C6.00208 10.6575 7.34458 12 9.00208 12C10.6596 12 12.0021 10.6575 12.0021 9C12.0021 7.3425 10.6596 6 9.00208 6ZM7.50208 9C7.50208 9.825 8.17708 10.5 9.00208 10.5C9.82708 10.5 10.5021 9.825 10.5021 9C10.5021 8.175 9.82708 7.5 9.00208 7.5C8.17708 7.5 7.50208 8.175 7.50208 9Z"
                    fill="white"
                  />
                </svg>
              </button>
            </Grid>

            <Grid container direction="column" alignItems="center" spacing={2}>
              <Grid item xs={12} className={classes.fullWidth}>
                <CoinField
                  imagePatch="../img/grimace_coin.png"
                  activeField={true}
                  value={field1Value}
                  onClick={() => setDialog1Open(true)}
                  onChange={handleChange.field1}
                  symbol={coin1.symbol !== undefined ? coin1.symbol : "Select"}
                  balance={formatBalance(coin1.balance, coin1.symbol) || "0"}
                />
              </Grid>

              <IconButton
                onClick={switchFields}
                className={classes.switchButton}
              >
                <SwapVert fontSize="large" />
              </IconButton>

              <Grid item xs={12} className={classes.fullWidth}>
                <CoinField
                  imagePath="../img/grimace_coin.png"
                  activeField={false}
                  value={field2Value}
                  onClick={() => setDialog2Open(true)}
                  symbol={coin2.symbol !== undefined ? coin2.symbol : "Select"}
                />
              </Grid>
              <LoadingButton
                loading={loading}
                valid={isButtonEnabled()}
                success={false}
                fail={false}
                onClick={swap}
              >
                <LoopIcon />
                {approveIsRequired ? `Approve ${coin1.symbol}` : "swap"}
              </LoadingButton>

              {/* Reserves Display */}
              <div className="gridswap">
                <Grid
                  container
                  spacing={12}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Grid item xs={6}>
                    <Typography variant="body1" className="textswap">
                      {formatReserve(reserves[0], coin1.symbol)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" className="textswap">
                      {formatReserve(reserves[1], coin2.symbol)}
                    </Typography>
                  </Grid>
                </Grid>
                {/* Price Impact Display */}
                <Grid container direction="row" justifyContent="space-between">
                  <Grid item xs={6}>
                    <Typography variant="body1" className="textswap">
                      Price Impact
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.17432 9.00122H6.06177C6.06576 8.61841 6.09965 8.30538 6.16345 8.06213C6.23124 7.8149 6.3409 7.5896 6.49243 7.38623C6.64396 7.18286 6.84534 6.95158 7.09656 6.69238C7.27999 6.50496 7.44747 6.32951 7.599 6.16602C7.75452 5.99854 7.88013 5.81909 7.97583 5.62769C8.07153 5.43229 8.11938 5.19902 8.11938 4.92786C8.11938 4.65271 8.06954 4.41545 7.96985 4.21606C7.87415 4.01668 7.73059 3.86316 7.53918 3.75549C7.35177 3.64783 7.11849 3.59399 6.83936 3.59399C6.60807 3.59399 6.38875 3.63586 6.1814 3.7196C5.97404 3.80334 5.80656 3.93294 5.67896 4.1084C5.55135 4.27987 5.48556 4.50517 5.48157 4.7843H4.375C4.38298 4.3337 4.49463 3.9469 4.70996 3.6239C4.92928 3.3009 5.22437 3.05367 5.59521 2.8822C5.96606 2.71073 6.38078 2.625 6.83936 2.625C7.34578 2.625 7.77645 2.71672 8.13135 2.90015C8.49023 3.08358 8.76339 3.34676 8.95081 3.6897C9.13822 4.02865 9.23193 4.4314 9.23193 4.89795C9.23193 5.25684 9.15816 5.58781 9.01062 5.89087C8.86707 6.18994 8.68164 6.47107 8.45435 6.73425C8.22705 6.99744 7.9858 7.24866 7.73059 7.48792C7.51127 7.69128 7.36373 7.92057 7.28796 8.17578C7.2122 8.43099 7.17432 8.70614 7.17432 9.00122ZM6.01392 10.8973C6.01392 10.7179 6.06974 10.5664 6.1814 10.4427C6.29305 10.3191 6.45455 10.2573 6.66589 10.2573C6.88123 10.2573 7.04472 10.3191 7.15637 10.4427C7.26803 10.5664 7.32385 10.7179 7.32385 10.8973C7.32385 11.0688 7.26803 11.2163 7.15637 11.34C7.04472 11.4636 6.88123 11.5254 6.66589 11.5254C6.45455 11.5254 6.29305 11.4636 6.1814 11.34C6.06974 11.2163 6.01392 11.0688 6.01392 10.8973Z"
                          fill="#D0D0D0"
                        />
                        <circle cx="7" cy="7" r="6.5" stroke="#D0D0D0" />
                      </svg>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" className="textswap">
                      {priceImpact}%
                    </Typography>
                  </Grid>
                </Grid>
              </div>
            </Grid>
          </Paper>
        </Container>
      </div>
    </div>
  );
}

export default CoinSwapper;
