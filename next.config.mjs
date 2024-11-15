/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost'],
        path: '/_next/image',
        remotePatterns: [
            {
                hostname: 'lh3.googleusercontent.com',                
            },
            {
                hostname: 'api.qrserver.com',
            },
            {
                hostname: 'localhost',
            },
            {
                hostname: 'pps.whatsapp.net',
            },
            {
                hostname: 'mmg.whatsapp.net',
            },
            {
                hostname: 'res.cloudinary.com',
            }
        ]
    },
    experimental: {
        serverActions: {
          bodySizeLimit: '22mb',
        },
    }
    
};

export default nextConfig;
