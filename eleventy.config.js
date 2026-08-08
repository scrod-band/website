module.exports = function (eleventyConfig) {
  // Static assets copied to the built site as-is
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("main.js");
  eleventyConfig.addPassthroughCopy("logo.png");
  eleventyConfig.addPassthroughCopy("bandcamp-button-bc-circle-green-64.png");
  eleventyConfig.addPassthroughCopy("photos");

  // Repo docs are not site pages
  eleventyConfig.ignores.add("README.md");

  // Footer copyright year, computed at build time
  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  // "August 22" / "2026" from a YYYY-MM-DD date string
  eleventyConfig.addFilter("showMonthDay", (dateStr) =>
    new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      timeZone: "UTC",
    }).format(new Date(dateStr))
  );
  eleventyConfig.addFilter("showYear", (dateStr) =>
    new Date(dateStr).getUTCFullYear()
  );

  // Only shows dated today or later appear on the site. Entries without a
  // date are kept (so a "TBA" show still displays). The list refreshes on
  // every deploy — publishing any change re-runs this filter.
  eleventyConfig.addFilter("upcoming", (shows) => {
    const today = new Date().toISOString().slice(0, 10);
    return (shows || []).filter((s) => !s.date || s.date >= today);
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      data: "_data",
      includes: "_includes",
    },
  };
};
