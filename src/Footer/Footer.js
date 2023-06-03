import React, { useState, useEffect } from 'react';
import "./Footer.css";
import discord from "../img/discord.svg"
import telegram from "../img/telegram.svg"
import twitter from "../img/twitter.svg"

function Footer() {


  return (
    <footer className='footer'>
      <div className='footer__social-links'>
        <a className='footer__social-link' href='https://discord.gg/grimacedoge'>
          <img src={discord} alt='discord'/>
        </a>
        <a className='footer__social-link' href='https://t.me/grimacecommunity'>
          <img src={telegram} alt='telegram'/>
        </a>
        <a className='footer__social-link' href='https://twitter.com/Grimacedogchain'>
          <img src={twitter} alt='twitter'/>
        </a>
      </div>
      <p>
        Grimace Swap | Get AUT for use in the bakerloo testnet{" "}
          <a href="https://faucet.bakerloo.autonity.network/">here</a>
      </p>
    </footer>
    // <Grid
    //     container
    //     direction="row"
    //     justifyContent="center"
    //     alignItems="flex-end"
    //   >
    //     <p>
    //     Grimace Swap | Get AUT for use in the bakerloo testnet{" "}
    //       <a href="https://faucet.bakerloo.autonity.network/">here</a>
    //     </p>
    //   </Grid>
  );
}

export default Footer;
