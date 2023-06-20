import React from "react";
import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import Footer from "../Footer/Footer";
import logo from "../img/grimace_swap_logo.png";
import text from "../img/GRIMACE_SWAP.png";

const styles = (theme) => ({
  paperContainer: {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(3),
    margin: "auto",
    maxWidth: "80ch",
    display: "grid",
    placeItems: "center",
  },
  fullWidth: {
    width: "100%",
  },
  title: {
    textAlign: "center",
    padding: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
    fontWeight: 900,
  },
  hr: {
    width: "100%",
  },
  balance: {
    padding: theme.spacing(1),
    overflow: "wrap",
    textAlign: "center",
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
    padding: theme.spacing(0.4),
  },
});

const useStyles = makeStyles(styles);

function ConnectWalletPage() {
  const classes = useStyles();
  return (
    <div className="CWPmain">
      <Container>
        <Paper className={classes.paperContainer}>
          <img className="Img" width="200px" src={logo} alt="Connect Wallet" />
          <img className="Img" width="400px" src={text} alt="Connect Wallet" />

          <p className="CWPtext">
            Please switch your Metamask to the Dogechain network
          </p>
        </Paper>
      </Container>

      <Footer />
    </div>
  );
}

export default ConnectWalletPage;
