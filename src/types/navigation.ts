/**
 * Type definitions for navigation data structure
 */

export interface NavItem {
  text: string;
  href: string;
  icon?: string;
  isExternal?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface NavMainItem {
  text: string;
  href: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  isExternal?: boolean;
  isMegaDropdown?: boolean;
  children?: NavSection[];
}

export interface NavFooterSection {
  text: string;
  description: string;
  icon?: string;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  isExternal?: boolean;
}

export interface NavData {
  main: NavMainItem[];
  right?: NavItem[];
  footer: NavFooterSection[];
  social: NavItem[];
  brand?: NavFooterSection[];
}
