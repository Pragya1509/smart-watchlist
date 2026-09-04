const { NseIndia } = require("stock-nse-india");
const nseIndia = new NseIndia();

(async () => {
  const details = await nseIndia.getEquityDetails("RELIANCE");
  console.log("DETAILS:", JSON.stringify(details, null, 2));

  const hist = await nseIndia.getEquityHistoricalData("RELIANCE", {
    start: new Date(Date.now() - 60 * 86400000),
    end: new Date(),
  });
  console.log("HISTORICAL SAMPLE:", JSON.stringify(hist[0], null, 2));
})();