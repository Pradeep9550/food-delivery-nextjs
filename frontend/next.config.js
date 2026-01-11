// next.config.js
module.exports = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        unoptimized: true, // For external images
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};