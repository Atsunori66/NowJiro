import Script from "next/script";

const MonetagInterstitial = () => {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  return (
    <Script id="monetag-interstitial" strategy="lazyOnload">
      {`
        (function(d, z, s) {
          s.src = 'https://' + d + '/401/' + z;
          try {
            (document.body || document.documentElement).appendChild(s)
          } catch(e) {}
        }) ('groleegni.net', 9054173, document.createElement('script'));
      `}
    </Script>
  );
};

export default MonetagInterstitial;
