import { Link } from "react-router-dom";
import logoWithTextImage from "../assets/logo_with_text-removebg-preview.png";
import logoIconImage from "../assets/logo_without_text-removebg-preview.png";
import { useTranslation } from "react-i18next";

const FacebookIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const InstagramIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const socialLinks = [
  { name: "Facebook", href: "#", Icon: FacebookIcon },
  { name: "Twitter", href: "#", Icon: TwitterIcon },
  { name: "Instagram", href: "#", Icon: InstagramIcon },
];

const orgLinks = [
  { labelKey: "footer.aboutUs", to: "/about" },
  { labelKey: "footer.tours", to: "/tours" },
];

const supportLinks = [
  { labelKey: "footer.helpCenter", href: "#" },
  { labelKey: "footer.terms", href: "#" },
  { labelKey: "footer.privacy", href: "#" },
  { labelKey: "footer.contactUs", to: "/contact" },
];

const compactLinks = [
  { labelKey: "footer.aboutUs", to: "/about" },
  { labelKey: "footer.tours", to: "/tours" },
  { labelKey: "footer.contactUs", to: "/contact" },
  { labelKey: "footer.help", href: "#" },
];

const linkClass =
  "text-xs md:text-sm font-extralight text-white/85 hover:text-white transition-colors";

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-[#4F200D] text-white py-3 sm:py-4 md:py-5 lg:py-9 rounded-t-[20px] md:rounded-t-[24px] lg:rounded-t-[44px]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
        {/* Compact footer for phone/tablet */}
        <div className="lg:hidden space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-2">
            <img
              src={logoIconImage}
              alt="Thai Tours Icon"
              className="h-7 sm:h-8 w-auto object-contain"
            />
            <p className="text-[11px] sm:text-xs font-extralight leading-snug text-white/85">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-2.5 gap-y-1">
            {compactLinks.map(({ labelKey, to, href }: any) =>
              to ? (
                <Link
                  key={labelKey}
                  to={to}
                  className="text-[12px] sm:text-xs text-white/85 hover:text-white transition-colors"
                >
                  {t(labelKey)}
                </Link>
              ) : (
                <a
                  key={labelKey}
                  href={href}
                  className="text-[12px] sm:text-xs text-white/85 hover:text-white transition-colors"
                >
                  {t(labelKey)}
                </a>
              ),
            )}
          </div>

          <div className="flex items-center gap-2">
            {socialLinks.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                aria-label={name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F6F1E9] text-[#4F200D] flex items-center justify-center hover:bg-white transition-colors"
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Full footer for desktop */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-x-6 gap-y-4 mb-5 md:mb-6">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2.5 mb-2.5 md:mb-3">
              <img
                src={logoWithTextImage}
                alt="Thai Tours Service"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-sm font-extralight leading-snug text-white/85 max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Organization Info */}
          <div>
            <h3 className="text-xl font-bold mb-2">{t('footer.orgInfo')}</h3>
            <ul className="space-y-1 md:space-y-1.5">
              {orgLinks.map(({ labelKey, to }) => (
                <li key={to}>
                  <Link to={to} className={linkClass}>
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-bold mb-2">{t('footer.support')}</h3>
            <ul className="space-y-1 md:space-y-1.5">
              {supportLinks.map(({ labelKey, href, to }: any) => (
                <li key={labelKey}>
                  {to ? (
                    <Link to={to} className={linkClass}>
                      {t(labelKey)}
                    </Link>
                  ) : (
                    <a href={href} className={linkClass}>
                      {t(labelKey)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xl font-bold mb-2">{t('footer.followUs')}</h3>
            <p className="text-xs font-extralight mb-3 text-white/85 max-w-xs">
              {t('footer.newsletter')}
            </p>
            <div className="flex gap-2.5 md:gap-3">
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className="w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full bg-[#F6F1E9] text-[#4F200D] flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 pt-2 sm:pt-2.5 md:pt-4 mt-3 lg:mt-0">
          <p className="text-[11px] sm:text-xs text-white/80 text-center md:text-left">
            © {year} Thai Tours Service. {t('footer.rights')}
          </p>
        </div>

      </div>
    </footer>
  );
}