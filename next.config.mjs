/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration de production (toutes les fonctionnalités)
  images: {
    unoptimized: false
  },
  // Activer toutes les fonctionnalités
  serverExternalPackages: ['pdf-lib']
};

export default nextConfig;
