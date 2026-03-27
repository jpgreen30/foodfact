import { NextResponse } from "next/server";
import { blogPosts } from "@/data/blogPosts";

export async function GET() {
  const baseUrl = "https://foodfactscanner.com";
  const now = new Date().toUTCString();

  const rssItems = blogPosts
    .map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt).toUTCString();

      return `
        <item>
          <title>${post.title}</title>
          <link>${postUrl}</link>
          <description>${post.excerpt}</description>
          <author>info@foodfactscanner.com (FoodFactScanner Team)</author>
          <category>${post.category}</category>
          <pubDate>${pubDate}</pubDate>
          <guid isPermaLink="true">${postUrl}</guid>
        </item>
      `;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FoodFactScanner Blog</title>
    <description>Expert advice on baby food safety, toxic chemical detection, and healthy nutrition for infants</description>
    <link>${baseUrl}/blog</link>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/rss" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}