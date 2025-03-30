import Script from "next/script";

const MonetagPush = () => {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  return (
    <Script
      src="https://upskittyan.com/act/files/tag.min.js"
      data-zone="9054171"
      strategy="afterInteractive"
      data-cfasync="false"
    />
  );
};

export default MonetagPush;
