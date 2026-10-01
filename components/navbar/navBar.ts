import Link from 'next/link';
import { createElement } from 'react';
import { NAV_LINKS } from '@/components/navbar/navConfig';
import MobileMenu from '@/components/navbar/MobileMenu';

export function Navbar() {
  return createElement(
    'header',
    { className: 'relative flex h-16 items-center justify-between px-4' },
    createElement(Link, { href: '/' }, 'Pulse'),
    createElement(
      'ul',
      { className: 'hidden gap-6 md:flex' },
      NAV_LINKS.map(({ label, href }) =>
        createElement(
          'li',
          { key: href },
          createElement(Link, { href }, label),
        ),
      ),
    ),
    createElement(MobileMenu),
  );
}
