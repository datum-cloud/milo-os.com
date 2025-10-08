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
  isExternal?: boolean;
  isMegaDropdown?: boolean;
  children?: NavSection[];
}

export interface NavFooterSection {
  title: string;
  description: string;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  href?: string;
}

export interface NavData {
  main: NavMainItem[];
  right?: NavItem[];
  footer: NavFooterSection[];
  social: NavItem[];
  brand?: NavFooterSection[];
}
