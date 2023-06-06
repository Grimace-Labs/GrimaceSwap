import React from "react";
import { ButtonGroup, Button,makeStyles } from "@material-ui/core";

const styles = (theme) => ({
  add_button: {
    '&:hover': {
      backgroundColor: 'rgba(113, 83, 217, 0.7)' // темнее при наведении
    },
  },
  remove_button: {
    '&:hover': {
      backgroundColor: 'rgba(113, 83, 217, 0.7)' // темнее при наведении
    },
  }
});

const useStyles = makeStyles(styles);

export default function SwitchButton(props) {
  const classes = useStyles();
  const { setDeploy } = props;

  const changeStyles = (K) => {
    if (K === true) {
      let add_button = document.getElementById("add-button");
      add_button.style.backgroundColor = "#ff0000";

      let remove_button = document.getElementById("remove-button");
      remove_button.style.backgroundColor = "#9e9e9e";
    } else {
      let remove_button = document.getElementById("remove-button");
      remove_button.style.backgroundColor = "#ff0000";

      let add_button = document.getElementById("add-button");
      add_button.style.backgroundColor = "#9e9e9e";
    }
  };

  return (
    <div>
      <ButtonGroup size="large" variant="contained">
        <Button
          id="add-button"
          color="primary"
          text="white"
          onClick={() => {
            setDeploy(true);
            changeStyles(true);
          }}
          className={classes.add_button}
          >
          Deploy Liquidity
        </Button>

        <Button
          id="remove-button"
          color="secondary"
          text="white"
          onClick={() => {
            setDeploy(false);
            changeStyles(false);
          }}
          className={classes.remove_button}
        >
          Remove Liquidity
        </Button>
      </ButtonGroup>
    </div>
  );
}
