import type { ImageMetadata } from 'astro';

export interface LayoutProps {
  title: string;
  description?: string;
  image?: string;
  article?: boolean;
  publishDate?: Date;
  author?: string;
  noindex?: boolean;
  canonical?: string;
  fluid?: boolean;
  dataTheme: string;
  bodyClass?: string;
  meta?: {
    title?: string;
    description?: string;
    image?: string;
    keywords?: string[];
    og?: {
      title?: string;
      description?: string;
      image?: string;
      url?: string;
    };
  };
}

export interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  class?: string;
  iconName?: string;
  imagePath?: ImageMetadata;
  hideContent?: boolean;
}

export interface ButtonProps {
  class?: string;
  text: string;
  title?: string;
  icon?: {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  };
  iconPosition?: 'left' | 'right';
  iconClass?: string;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  [key: `data-${string}`]: string | undefined;
}

export interface FooterProps {
  showCTA?: boolean;
}
