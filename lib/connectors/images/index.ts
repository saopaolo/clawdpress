import type { ImageConnector } from './types';
import { unsplashConnector } from './unsplash';
import { pexelsConnector } from './pexels';
import { gettyConnector } from './getty';
import { cloudinaryConnector } from './cloudinary';

export * from './types';

/**
 * Registry of all image connectors.
 *
 * To add a new provider: write an adapter implementing ImageConnector
 * in this folder, then add it here. The API routes and editor UI
 * iterate this registry automatically.
 */
export const imageConnectors: Record<string, ImageConnector> = {
  unsplash: unsplashConnector,
  pexels: pexelsConnector,
  getty: gettyConnector,
  cloudinary: cloudinaryConnector,
};

export function getConfiguredConnectors(): ImageConnector[] {
  return Object.values(imageConnectors).filter(c => c.isConfigured());
}
