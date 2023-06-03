import React from "react";
import { Button, CircularProgress, makeStyles } from "@material-ui/core";
import green from "@material-ui/core/colors/green";
import red from "@material-ui/core/colors/red";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    margin: 0,
    position: "relative",
    width:'100%',
  },
  btnSwap: {
    height: '50px',
    background: 'linear-gradient(90.8deg, #7153D9 0%, #7B2DDE 100%)',
    boxShadow: '0px 4px 16px rgba(23, 25, 66, 0.16)',
    borderRadius: '20px',

  },
  progress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

export default function LoadingButton(props) {
  const classes = useStyles();
  const { children, loading, valid, success, fail, onClick, ...other } = props;
  return (
    <div className={classes.wrapper}>
      <Button
        className={classes.btnSwap}
        variant="contained"
        color="white"
        fullWidth
        disabled={loading || !valid}
        type="submit"
        onClick={onClick}
        {...other}
      >
        {children}
      </Button>
      {loading && <CircularProgress size={24} className={classes.progress} />}
    </div>
  );
}
