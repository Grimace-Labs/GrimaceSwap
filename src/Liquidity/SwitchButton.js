import React, { useState } from "react";
import { ButtonGroup, Button, makeStyles, createMuiTheme, ThemeProvider } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  selected: {
    backgroundColor: "rgba(113, 83, 217, 1)",
    '&:hover': {
      backgroundColor: 'rgba(113, 83, 217, 0.7)' // темнее при наведении
    },
  },
  notSelected: {
    backgroundColor: "#9e9e9e",
    '&:hover': {
      backgroundColor: 'rgba(113, 83, 217, 0.7)' // темнее при наведении
    },
  }
}));

const theme = createMuiTheme({
  palette: {
    primary: {
      main: 'rgba(113, 83, 217, 1)',
    },
  },
});

export default function SwitchButton(props) {
  const classes = useStyles();
  const { setDeploy } = props;

  const [selected, setSelected] = useState('add');  // by default, the 'add' button is selected

  const handleClick = (type) => {
    setDeploy(type === 'add');
    setSelected(type);
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        <ButtonGroup size="large" variant="contained">
          <Button
            id="add-button"
            color="primary"
            text="white"
            onClick={() => handleClick('add')}
            className={selected === 'add' ? classes.selected : classes.notSelected}
          >
            Deploy Liquidity
          </Button>

          <Button
            id="remove-button"
            color="primary"
            text="white"
            onClick={() => handleClick('remove')}
            className={selected === 'remove' ? classes.selected : classes.notSelected}
          >
            Remove Liquidity
          </Button>
        </ButtonGroup>
      </div>
    </ThemeProvider>
  );
}
