import Script from "next/script";

const MonetagInpage = () => {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  return (
    <Script id="monetag-inpage" strategy="afterInteractive">
      {`
        (function(d, z, s) {
          s.src = 'https://' + d + '/400/' + z;
          try {
            (document.body || document.documentElement).appendChild(s)
          } catch(e) {}
        }) ('vemtoutcheeg.com', 9029472, document.createElement('script'));
      `}
    </Script>
  );
};

export default MonetagInpage;
