import axios from "axios";
import { load } from "cheerio";

function cleanTextFromHtml(html) {
  const $ = load(html);
  $("script, style").remove();
  return $.text().replace(/\s+/g, " ").trim();
}

export async function performWebSearch(query) {
  const searchUrl = "http://192.168.3.42:9090/search";
  const params = {
    q: query,
    format: "json",
    number_of_results: 20,
  };
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                  "AppleWebKit/537.36 (KHTML, like Gecko) " +
                  "Chrome/111.0.0.0 Safari/537.36"
  };
  
  try {
    const response = await axios.get(searchUrl, { params, headers, timeout: 10_000 });
    const data = response.data;
    const results = data.results || [];

    if (!results.length) {
      return "No results found.";
    }

    let scrapedText = "";
    for (const result of results) {
      const title = result.title || "No Title";
      const url = result.url;
      if (!url) continue;

      try {
        const pageRes = await axios.get(url, { headers, timeout: 10_000 });
        if (pageRes.status !== 200) continue;
        const pageText = cleanTextFromHtml(pageRes.data);
        const words = pageText.split(/\s+/);
        if (words.length < 50) continue;

        const limitedText = words.slice(0, 5000).join(" ");
        scrapedText += `**Title:** ${title}\n**URL:** ${url}\n**Content:** ${limitedText}\n\n`;
      } catch {
      }
    }
    return scrapedText || "No results found.";
} catch (err) {
    return `Error during web search: ${err.message}`;
}
}



export async function scrapeWebsite(url) {
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }
  
    const headers = {
      "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/111.0.0.0 Safari/537.36"
      )
    };
  
    async function tryFetch(u) {
      const res = await axios.get(u, { headers, timeout: 20_000 });
      const $ = load(res.data);
      $("script, style").remove();
      const text = $.text().replace(/\s+/g, " ").trim();
      return text;
    }
  
    try {
      let text = await tryFetch(finalUrl);
  
      const words = text.split(/\s+/);
      if (words.length < 50) {
        return "";
      }
      const limitedText = words.slice(0, 5000).join(" ");
      return limitedText;
  
    } catch (errFirst) {
        console.error("First attempt failed:", errFirst.message);
  
      if (finalUrl.startsWith("https://")) {
        const fallbackUrl = finalUrl.replace(/^https:\/\//i, "http://");
        console.log("Attempting fallback with:", fallbackUrl);
  
        try {
          let text = await axios.get(fallbackUrl, { headers, timeout: 20_000 })
            .then(r => {
              const $ = load(r.data);
              $("script, style").remove();
              return $.text().replace(/\s+/g, " ").trim();
            });
  
          const words = text.split(/\s+/);
          if (words.length < 50) {
            return "";
          }
          return words.slice(0, 5000).join(" ");
        } catch (errSecond) {
            console.error("Fallback attempt also failed:", errSecond.message);
            return "";
        }
      } else {
        return "";
      }
    }
}