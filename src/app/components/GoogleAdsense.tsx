import Script from "next/script";

const publisherID = "8206959566181911";

const GoogleAdsense = () => {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${publisherID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};

export default GoogleAdsense;
