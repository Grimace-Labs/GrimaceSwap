import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";

import {
  Container,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import SwapVerticalCircleIcon from "@material-ui/icons/SwapVerticalCircle";
import { useSnackbar } from "notistack";
import LoopIcon from "@material-ui/icons/Loop";
import {
  getAmountOut,
  getBalanceAndSymbol,
  swapTokens,
  getReserves,
  getAllowance,
  approveToken
} from "../ethereumFunctions";
import CoinField from "./CoinField";
import LoadingButton from "../Components/LoadingButton";
import WrongNetwork from "../Components/wrongNetwork";
import { dogechainRouter } from "../constants/chains";
import { DOGE, GRIMACE } from "../constants/coins";

const styles = (theme) => ({
  allContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: '0 20px'
  },
  paperContainer: {
    backgroundColor: '#2F2A70',
    borderRadius: theme.spacing(2),
    border: '2px solid rgba(113, 83, 217, 1)',
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    color: 'white'
  },
  switchButton: {
    zIndex: 1,
    margin: "-16px",
    padding: theme.spacing(0.5),
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
    marginTop: "285px",
  },
});

const useStyles = makeStyles(styles);

function CoinSwapper(props) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [approveIsRequired, setApproveRequired] = useState(false);
  const [priceImpact, setPriceImpact] = useState('0');

  // Stores a record of whether their respective dialog window is open
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
  const reverseDefaultValue = '0.0';
  const [reserves, setReserves] = React.useState([reverseDefaultValue, reverseDefaultValue]);

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

  //Fetch allowance if coin or account changed.
  useEffect(() => {
    if (
      !coin1.address || 
      !props.network.account ||
      !props.network.provider ||
      !props.network.signer ||
      !props.network.weth.address ||
      !props.network.coins
    ) return;

    getBalanceAndSymbol(props.network.account, coin1.address, props.network.provider, props.network.signer, props.network.weth.address, props.network.coins).then((data) => {
      if (props.network.weth.address !== coin1.address){
        getAllowance(coin1.address, props.network.account, dogechainRouter, props.network.signer).then((allowance) => {
          if (!allowance) return;

          console.log(`Allowance checked | Allowed: ${ethers.utils.formatUnits(allowance, 18)} | Balance: ${data.balance}`)

          setApproveRequired(allowance.lt(data.balanceRaw));
        });
      }
    });
  }, [coin1.address, props.network.account, props.network.provider, props.network.signer, props.network.weth.address, props.network.coins, props.network.router]);


  // Calls the swapTokens Ethereum function to make the swap, then resets nessicary state variables
  const swap = () => {
    console.log("Attempting to swap tokens...");
    setLoading(true);

    if (approveIsRequired){
      return approveToken(
        coin1.address, 
        dogechainRouter, 
        props.network.signer
      ).then(() => {
        setLoading(false);
        setApproveRequired(false);
        enqueueSnackbar("Approved", { variant: "success" });
      }).catch((e) => {
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
      getReserves(coin1.address, coin2.address, props.network.factory, props.network.signer, props.network.account).then(
        (data) => setReserves(data)
      );
    }
  }, [coin1.address, coin2.address, props.network.account, props.network.factory, props.network.router, props.network.signer]);

  // This hook is called when either of the state variables `field1Value` `coin1.address` or `coin2.address` change.
  // It attempts to calculate and set the state variable `field2Value`
  // This means that if the user types a new value into the conversion box or the conversion rate changes,
  // the value in the output box will change.
  useEffect(() => {
    if (isNaN(parseFloat(field1Value))) {
      setField2Value("");
    } else if (parseFloat(field1Value) && coin1.address && coin2.address) {
      //Async update balance after input
      getBalanceAndSymbol(
        props.network.account,
        coin1.address,
        props.network.provider,
        props.network.signer,
        props.network.weth.address,
        props.network.coins
        ).then(
        (data) => {
          setCoin1({
            ...coin1,
            balance: data.balance,
          });
        }
      );

      getBalanceAndSymbol(
        props.network.account,
        coin2.address,
        props.network.provider,
        props.network.signer,
        props.network.weth.address,
        props.network.coins
        ).then(
        (data) => {
          setCoin2({
            ...coin2,
            balance: data.balance,
          });
        }
      );

      getAmountOut(coin1.address, coin2.address, field1Value, props.network.router, props.network.signer).then(
        (amount) => {
          setField2Value(amount.toFixed(7));

          //Calculate price impact
          const inPoolSize = new BigNumber(ethers.utils.parseUnits(reserves[0], 18).toString());
          const outPoolSize = new BigNumber(ethers.utils.parseUnits(reserves[1], 18).toString());
          const inAmount = new BigNumber(ethers.utils.parseUnits(field1Value, 18).toString());

          const proportionBefore = outPoolSize.div(inPoolSize);
  
          console.log(`1 token per: [BEFORE] ${proportionBefore.toString()}`);

          const constantProduct = inPoolSize.times(outPoolSize);

          const inPoolSizeAfter = inPoolSize.plus(inAmount);
          const outPoolSizeAfter = constantProduct.div(inPoolSizeAfter)

          const proportionAfter = outPoolSizeAfter.div(inPoolSizeAfter);

          console.log(`1 token per [AFTER]: ${proportionAfter.toString()}`);

          const differentAmount = proportionBefore.minus(proportionAfter);
          const differentPersentage = differentAmount.div(proportionBefore).times(100);

          setPriceImpact(differentPersentage.toFixed(2));
        }).catch(e => {
          console.log(e);
          setField2Value("NA");
      })
    } else {
      setField2Value("");
    }
  }, [field1Value, coin1.address, coin2.address, reserves, props.network.router, props.network.signer]);

  // This hook creates a timeout that will run every ~10 seconds, it's role is to check if the user's balance has
  // updated has changed. This allows them to see when a transaction completes by looking at the balance output.
  useEffect(() => {
    const coinTimeout = setTimeout(() => {
      console.log('props: ', props);
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

      if (coin1.address && props.network.account &&!wrongNetworkOpen) {
        getBalanceAndSymbol(
          props.network.account,
          coin1.address,
          props.network.provider,
          props.network.signer,
          props.network.weth.address,
          props.network.coins
          ).then(
          (data) => {
            setCoin1({
              ...coin1,
              balance: data.balance,
            });
          }
        );
      }
      if (coin2.address && props.network.account &&!wrongNetworkOpen) {
        getBalanceAndSymbol(
          props.network.account,
          coin2.address,
          props.network.provider,
          props.network.signer,
          props.network.weth.address,
          props.network.coins
          ).then(
          (data) => {
            setCoin2({
              ...coin2,
              balance: data.balance,
            });
          }
        );
      }
    }, 10000);

    return () => clearTimeout(coinTimeout);
  });

  //Auto set DOGE/GRIMACE pair..
  useEffect(() => {
    setCoin1(DOGE);
    setCoin2(GRIMACE);
  }, []);

  return (
    <div className={classes.allContainer}>
      {/* Coin Swapper */}
      <iframe 
          src="https://dexscreener.com/dogechain/0x1aAD352a2190B399Bb3cfD4d5E4B0bf6EFA33C0e?embed=1&theme=dark&trades=0&info=0"
          title="MyFrame"
          width="800px"
          height="600px"             
      ></iframe>
      <Container maxWidth="xs" className={classes.swapContainer}>
        <Paper className={classes.paperContainer}>
          <Typography variant="h5" className={classes.title}>
            Swap Coins
          </Typography>

          <Grid container direction="column" alignItems="center" spacing={2}>
            <Grid item xs={12} className={classes.fullWidth}>
              <CoinField
                activeField={true}
                value={field1Value}
                onChange={handleChange.field1}
                symbol={coin1.symbol !== undefined ? coin1.symbol : "Select"}
              />
            </Grid>

            <IconButton onClick={switchFields} className={classes.switchButton}>
              <SwapVerticalCircleIcon fontSize="medium" />
            </IconButton>

            <Grid item xs={12} className={classes.fullWidth}>
              <CoinField
                activeField={false}
                value={field2Value}
                symbol={coin2.symbol !== undefined ? coin2.symbol : "Select"}
              />
            </Grid>

            <hr className={classes.hr} />

            {/* Balance Display */}
            <Typography variant="h6">Your Balances</Typography>
            <Grid container direction="row" justifyContent="space-between">
              <Grid item xs={6}>
                <Typography variant="body1" className={classes.balance}>
                  {formatBalance(coin1.balance, coin1.symbol)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" className={classes.balance}>
                  {formatBalance(coin2.balance, coin2.symbol)}
                </Typography>
              </Grid>
            </Grid>

            <hr className={classes.hr} />

            {/* Reserves Display */}
            <Typography variant="h6">Reserves</Typography>
            <Grid container direction="row" justifyContent="space-between">
              <Grid item xs={6}>
                <Typography variant="body1" className={classes.balance}>
                  {formatReserve(reserves[0], coin1.symbol)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" className={classes.balance}>
                  {formatReserve(reserves[1], coin2.symbol)}
                </Typography>
              </Grid>
            </Grid>

            <hr className={classes.hr} />

            <LoadingButton
              loading={loading}
              valid={isButtonEnabled()}
              success={false}
              fail={false}
              onClick={swap}
            >
              <LoopIcon />
              { approveIsRequired ? `Approve ${coin1.symbol}` : "swap" }
            </LoadingButton>
          </Grid>
        </Paper>
      </Container>
    </div>
  );
}

export default CoinSwapper;