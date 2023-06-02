import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { MenuItems } from "./MenuItems";
import "./NavBar.css";
import logo from "../img/grimace_coin.png"

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
      <div className="Title">
        <img src={logo} alt="logo"/>
        <h1 className="navbar-logo">
          GrimaceSwap
        </h1>
        <span>alpha</span>
      </div>

      <div className="NavbarItems">
        <ul className={`nav-menu`}>
        {MenuItems.map((item, index) => {
          return (
            <li key={index}>
              <Link className={"nav-links"} to={item.url}>
                {isMobile && item.img && <img src={item.img} alt="home" className="nav-img"/>}
                {<span>{item.title}</span>}
              </Link>
            </li>
          );
        })}
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
