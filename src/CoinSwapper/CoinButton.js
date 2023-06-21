import React from "react";
import { ButtonBase, Grid, makeStyles, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import * as COLORS from "@material-ui/core/colors";
import grimaceCoinImage from "../img/grimace_coin.png";
import dogeCoinImage from "../img/Dogecoin.png";
import wdCoinImage from "../img/DC.webp";
const useStyles = makeStyles((theme) => ({
  button: {
    width: "100%",
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    "&:hover, &$focusVisible": {
      backgroundColor: "#1A1928",
    },
  },
  coinName: {
    opacity: 0.6,
  },
  coinImage: {
    width: "24px", // Задайте желаемую ширину изображения
    height: "24px", // Задайте желаемую высоту изображения
    marginRight: theme.spacing(1), // Добавлено для отступа между изображением и названием монеты
  },
}));

CoinButton.propTypes = {
  coinName: PropTypes.string.isRequired,
  coinAbbr: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default function CoinButton(props) {
  const { coinName, coinAbbr, onClick, coinImage, ...other } = props;
  const classes = useStyles();

  return (
    <ButtonBase focusRipple className={classes.button} onClick={onClick}>
      <Grid container direction="column">
        <Typography variant="h6">{coinAbbr}</Typography>
        <Typography variant="body2" className={classes.coinName}>
          <img src={coinImage} alt={coinName} className={classes.coinImage} />
          {coinName}
        </Typography>
      </Grid>
    </ButtonBase>
  );
}
