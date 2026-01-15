import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = 'Fronto - Cyber Music Player', 
  description = 'Experience music in a futuristic cyberpunk interface with Fronto.',
  keywords = 'music player, cyberpunk, audio, playlist, frontend',
  image = '/PTracklist.png',
  url = window.location.href
}) => {
  const siteTitle = title;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />

      {/* Open Graph tags */}
      <meta property='og:type' content='website' />
      <meta property='og:title' content={siteTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image} />
      <meta property='og:url' content={url} />

      {/* Twitter tags */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={siteTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Fronto",
          "url": window.location.origin,
          "description": description,
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Web",
          "image": image
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
