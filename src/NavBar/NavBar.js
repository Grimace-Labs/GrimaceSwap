import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { MenuItems } from "./MenuItems";
import "./NavBar.css";

import logo from "../img/grimace_coin.png"

import discord from "../img/discord.svg"
import telegram from "../img/telegram.svg"
import twitter from "../img/twitter.svg"

function NavBar() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);

    // cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 900;

  return (
    <nav className="nav">
      <Link className="Title" to="/">
        <img src={logo} alt="logo"/>
        <h1 className="navbar-logo">
          GrimaceSwap
        </h1>
        <span>alpha</span>
      </Link>

      <div className="NavbarItems">
        <ul className={`nav-menu`}>
        {MenuItems.map((item, index) => {
          return (
            <li key={index}>
              {item.isExternal ? (
                <a className={item.cName} href={item.url} target="_blank" rel="noopener noreferrer">
                  {isMobile && item.img && <img src={item.img} alt={item.title} className="nav-img"/>}
                  <span>{item.title}</span>
                </a>
              ) : (
                <Link className={item.cName} to={item.url}>
                  {isMobile && item.img && <img src={item.img} alt={item.title} className="nav-img"/>}
                  <span>{item.title}</span>
                </Link>
              )}
            </li>
          );
        })}
        </ul>
        </div>
        <div className='nav__social-links'>
          <a className='nav__social-link' href='https://discord.gg/grimacedoge'>
            <img src={discord} alt='discord'/>
          </a>
          <a className='nav__social-link' href='https://t.me/grimacecommunity'>
            <img src={telegram} alt='telegram'/>
          </a>
          <a className='nav__social-link' href='https://twitter.com/Grimacedogchain'>
            <img src={twitter} alt='twitter'/>
          </a>
      </div>
    </nav>
  );
}

export default NavBar;
