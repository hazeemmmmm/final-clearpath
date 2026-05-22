import React from 'react';

const Footer = ({ isHome }) => {
  return (
    <footer className={isHome ? "home-footer" : "default-footer"}>
      <div className="footer-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <div className="footer-logo" style={{ fontSize: '15px' }}>
          <span className="logo-icon"><i className="fa-solid fa-map-marked-alt"></i></span> Clear<span style={{ color: '#fff' }}>Path</span>
        </div>
        <div className="footer-contact" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '12px', margin: '0' }}>
          <p style={{ margin: '0' }}><i className="fa-solid fa-phone"></i> 01001799282</p>
          <p style={{ margin: '0' }}><i className="fa-solid fa-headset"></i> Hotline: 19555</p>
          <p style={{ margin: '0' }}><i className="fa-solid fa-envelope"></i> info@clearpath.com</p>
        </div>
        <div className="footer-socials" style={{ display: 'flex', gap: '15px', fontSize: '14px', margin: '0' }}>
          <a href="#" style={{ color: 'inherit' }}><i className="fa-brands fa-facebook"></i></a>
          <a href="#" style={{ color: 'inherit' }}><i className="fa-brands fa-instagram"></i></a>
        </div>
        <p style={{ fontSize: '10px', margin: '0', color: '#ddd' }}>&copy; 2026 ClearPath. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
