import Script from "next/script";

const MonetagBanner = () => {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  return (
    <Script id="monetag-banner" strategy="lazyOnload">
      {`
        (function(d, z, s) {
          s.src = 'https://' + d + '/401/' + z;
          try {
            (document.body || document.documentElement).appendChild(s)
          } catch(e) {}
        }) ('gizokraijaw.net', 9054180, document.createElement('script'));
      `}
    </Script>
  );
};

export default MonetagBanner;
