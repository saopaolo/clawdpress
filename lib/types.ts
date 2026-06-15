/**
 * ClawdPress core content model.
 *
 * Everything in ClawdPress is JSON-serialisable and stored as flat files
 * under /content. This keeps the system git-friendly, diffable, and easy
 * to sync, back up, or migrate — no database required.
 */

export type BlockType = 'hero' | 'text' | 'features' | 'cta' | 'faq' | 'image';

export interface ImageAsset {
  url: string;
  fullUrl?: string;
  width?: number;
  height?: number;
  alt: string;
  provider?: 'unsplash' | 'pexels' | 'getty' | 'cloudinary' | 'custom';
  attribution?: {
    author?: string;
    sourceName?: string;
    sourceUrl?: string;
    license?: string;
  };
}

export interface HeroBlockData {
  tag?: string;
  title: string;
  body?: string;
  cta?: string;
  ctaHref?: string;
  cta2?: string;
  cta2Href?: string;
  image?: ImageAsset;
}

export interface TextBlockData {
  title?: string;
  body: string;
}

export interface FeatureItem {
  icon?: string;
  title: string;
  body: string;
}

export interface FeaturesBlockData {
  title: string;
  sub?: string;
  features: FeatureItem[];
}

export interface CTABlockData {
  title: string;
  body?: string;
  cta?: string;
  ctaHref?: string;
  cta2?: string;
  cta2Href?: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQBlockData {
  title: string;
  faqs: FAQItem[];
}

export interface ImageBlockData {
  image: ImageAsset;
  caption?: string;
}

export type BlockData =
  | HeroBlockData
  | TextBlockData
  | FeaturesBlockData
  | CTABlockData
  | FAQBlockData
  | ImageBlockData;

export interface Block {
  id: string;
  type: BlockType;
  data: BlockData;
}

export interface SEOMeta {
  title?: string;
  description?: string;
  keyword?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface Page {
  id: string;
  name: string;
  slug: string; // e.g. "/" or "/about"
  icon?: string;
  seo?: SEOMeta;
  blocks: Block[];
  updatedAt?: string;
}

export interface SiteConfig {
  name: string;
  url: string;
  description?: string;
  logo?: string;
  favicon?: string;
  theme?: {
    primaryColor?: string;
    fontHeading?: string;
    fontBody?: string;
  };
  social?: Record<string, string>;
  navigation?: { label: string; href: string }[];
}

export interface ConnectorConfig {
  claude?: { enabled: boolean };
  supabase?: { enabled: boolean; url?: string };
  unsplash?: { enabled: boolean };
  pexels?: { enabled: boolean };
  getty?: { enabled: boolean };
  cloudinary?: { enabled: boolean; cloudName?: string };
}
