import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';

const Footer = () => {
  const { lang } = useContext(LanguageContext);

  return (
    <footer className={`tw-bg-slate-100 dark:tw-bg-[#050505] tw-border-t tw-border-slate-200 dark:tw-border-slate-900 tw-pt-20 tw-pb-10 tw-font-sans ${lang === 'AR' ? 'tw-dir-rtl' : ''}`}>
      <div className="tw-container tw-mx-auto tw-px-4">
        
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-12 tw-mb-16">
          
          {/* Brand Info */}
          <div className="tw-flex tw-flex-col tw-gap-6">
            <Link to="/" className="tw-inline-block">
              <span className="tw-text-2xl tw-font-serif tw-font-bold tw-tracking-wide tw-text-rose-600 dark:tw-text-rose-200">
                Clear<span className="tw-text-rose-500 dark:tw-text-rose-300">Path</span>
              </span>
            </Link>
            <p className="tw-text-sm tw-text-slate-600 dark:tw-text-slate-400 tw-leading-relaxed tw-max-w-xs">
              {lang === 'AR' 
                ? 'تجربة فاخرة لا تُنسى في قلب حضارة مصر القديمة. صممت رحلاتنا خصيصاً لتناسب راحتك وخصوصيتك.' 
                : 'An unforgettable luxury experience in the heart of ancient Egypt. Our journeys are tailored specifically for your comfort and privacy.'}
            </p>
            <div className="tw-flex tw-gap-4">
              <a href="#" className="tw-w-8 tw-h-8 tw-rounded-full tw-border tw-border-slate-700 tw-flex tw-items-center tw-justify-center hover:tw-text-amber-500 hover:tw-border-amber-500 tw-transition-colors">
                <i className="fa-solid fa-globe tw-text-sm"></i>
              </a>
              <a href="#" className="tw-w-8 tw-h-8 tw-rounded-full tw-border tw-border-slate-700 tw-flex tw-items-center tw-justify-center hover:tw-text-amber-500 hover:tw-border-amber-500 tw-transition-colors">
                <i className="fa-solid fa-envelope tw-text-sm"></i>
              </a>
              <a href="#" className="tw-w-8 tw-h-8 tw-rounded-full tw-border tw-border-slate-700 tw-flex tw-items-center tw-justify-center hover:tw-text-amber-500 hover:tw-border-amber-500 tw-transition-colors">
                <i className="fa-solid fa-phone tw-text-sm"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="tw-text-slate-900 dark:tw-text-white tw-font-bold tw-tracking-widest tw-mb-6 tw-text-sm tw-uppercase">
              {lang === 'AR' ? 'روابط سريعة' : 'QUICK LINKS'}
            </h4>
            <ul className="tw-space-y-4">
              <li><Link to="/" className="tw-text-slate-600 dark:tw-text-slate-400 hover:tw-text-amber-500 tw-transition-colors tw-text-sm">{lang === 'AR' ? 'الرئيسية' : 'Home'}</Link></li>
              <li><Link to="/experiences" className="tw-text-slate-600 dark:tw-text-slate-400 hover:tw-text-amber-500 tw-transition-colors tw-text-sm">{lang === 'AR' ? 'الباقات' : 'Packages'}</Link></li>
              <li><Link to="/about" className="tw-text-slate-600 dark:tw-text-slate-400 hover:tw-text-amber-500 tw-transition-colors tw-text-sm">{lang === 'AR' ? 'من نحن' : 'About Us'}</Link></li>
              <li><Link to="/contact" className="tw-text-slate-600 dark:tw-text-slate-400 hover:tw-text-amber-500 tw-transition-colors tw-text-sm">{lang === 'AR' ? 'تواصل معنا' : 'Contact'}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="tw-text-slate-900 dark:tw-text-white tw-font-bold tw-tracking-widest tw-mb-6 tw-text-sm tw-uppercase">
              {lang === 'AR' ? 'القوانين' : 'LEGAL'}
            </h4>
            <ul className="tw-space-y-4">
              <li><Link to="/privacy" className="tw-text-slate-600 dark:tw-text-slate-400 hover:tw-text-amber-500 tw-transition-colors tw-text-sm">{lang === 'AR' ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
              <li><Link to="/terms" className="tw-text-slate-600 dark:tw-text-slate-400 hover:tw-text-amber-500 tw-transition-colors tw-text-sm">{lang === 'AR' ? 'الشروط والأحكام' : 'Terms & Conditions'}</Link></li>
              <li><Link to="/refunds" className="tw-text-slate-600 dark:tw-text-slate-400 hover:tw-text-amber-500 tw-transition-colors tw-text-sm">{lang === 'AR' ? 'سياسة الاسترجاع' : 'Refund Policy'}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="tw-text-slate-900 dark:tw-text-white tw-font-bold tw-tracking-widest tw-mb-6 tw-text-sm tw-uppercase">
              {lang === 'AR' ? 'تواصل معنا' : 'CONTACT US'}
            </h4>
            <ul className="tw-space-y-4">
              <li className="tw-flex tw-items-start tw-gap-3 tw-text-slate-600 dark:tw-text-slate-400 tw-text-sm">
                <i className="fa-solid fa-location-dot tw-mt-1 tw-text-amber-500"></i>
                <span>12 Nile Corniche, Luxor, Egypt</span>
              </li>
              <li className="tw-flex tw-items-center tw-gap-3 tw-text-slate-600 dark:tw-text-slate-400 tw-text-sm">
                <i className="fa-solid fa-phone tw-text-amber-500"></i>
                <span className="tw-dir-ltr">+20 123 456 7890</span>
              </li>
              <li className="tw-flex tw-items-center tw-gap-3 tw-text-slate-600 dark:tw-text-slate-400 tw-text-sm">
                <i className="fa-solid fa-envelope tw-text-amber-500"></i>
                <span>info@clearpath.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="tw-border-t tw-border-slate-800/50 tw-pt-8 tw-text-center">
          <p className="tw-text-xs tw-text-slate-500">
            © 2026 ClearPath. {lang === 'AR' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
