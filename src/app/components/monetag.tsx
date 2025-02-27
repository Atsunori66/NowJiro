import Script from "next/script";

const Monetag = () => {
//   if (process.env.NODE_ENV !== "production") {
//     return null;
//   }
  return (
    <Script
      src="https://kulroakonsu.net/88/tag.min.js"
      data-zone="133688"
      strategy="beforeInteractive"
      data-cfasync="false"
    />
  );
};

export default Monetag;
