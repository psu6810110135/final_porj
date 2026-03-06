import { Link } from "react-router-dom";
import logoImage from "../assets/logo.png";

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const socialLinks = [
  { name: "Facebook",  href: "#", Icon: FacebookIcon  },
  { name: "Twitter",   href: "#", Icon: TwitterIcon   },
  { name: "Instagram", href: "#", Icon: InstagramIcon },
];

const orgLinks = [
  { label: "เกี่ยวกับเรา",      to: "/about" },
  { label: "สถานที่ท่องเที่ยว", to: "/tours"  },
];

const supportLinks = [
  { label: "ศูนย์ช่วยเหลือ",           href: "#"         },
  { label: "เงื่อนไขการให้บริการ",      href: "#"         },
  { label: "นโยบายความเป็นส่วนตัว",    href: "#"         },
  { label: "ติดต่อเรา",                 to:   "/contact"  },
];

const lkCls = "text-xs text-white/70 hover:text-white transition-colors leading-relaxed";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#4F200D] text-white pt-5 pb-4 rounded-t-[24px] md:rounded-t-[36px]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">

          {/* Logo — spans full width on mobile, 1 col on md+ */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="Thai Tours Logo" className="h-7 w-auto object-contain" />
              <span className="text-sm font-bold leading-tight">Thai Tours<br className="hidden md:block" /> Service</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed max-w-[260px]">
              เที่ยวอย่างมั่นใจไปกับเรา สร้างความทรงจำที่ประทับใจมิรู้ลืม
            </p>
            {/* Social — show here on mobile */}
            <div className="flex gap-2 mt-1 md:hidden">
              {socialLinks.map(({ name, href, Icon }) => (
                <a key={name} href={href} aria-label={name}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Org */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">ข้อมูลองค์กร</h3>
            {orgLinks.map(({ label, to }) => (
              <Link key={to} to={to} className={lkCls}>{label}</Link>
            ))}
          </div>

          {/* Support */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Support</h3>
            {supportLinks.map(({ label, href, to }) => (
              <span key={label}>
                {to
                  ? <Link to={to} className={lkCls}>{label}</Link>
                  : <a href={href} className={lkCls}>{label}</a>
                }
              </span>
            ))}
          </div>

          {/* Social — desktop only */}
          <div className="hidden md:flex flex-col gap-1.5">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">ติดตามข่าวสาร</h3>
            <p className="text-xs text-white/60 leading-relaxed mb-2">
              ไม่พลาดข้อเสนอและข่าวสารพิเศษ
            </p>
            <div className="flex gap-2">
              {socialLinks.map(({ name, href, Icon }) => (
                <a key={name} href={href} aria-label={name}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/10 mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between gap-1">
          <p className="text-[11px] text-white/40">© {year} Thai Tours Service. All rights reserved.</p>
          <p className="text-[11px] text-white/30">Made with ❤️ in Thailand</p>
        </div>

      </div>
    </footer>
  );
}