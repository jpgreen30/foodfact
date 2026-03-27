import { blogPosts, getCategories } from "@/data/blogPosts";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Search } from "lucide-react";

export const metadata = {
  title: "Baby Food Safety Blog | FoodFactScanner",
  description: "Expert advice on baby food safety, toxic chemical detection, and healthy nutrition for infants. Stay informed with our comprehensive blog.",
  keywords: ["baby food safety", "heavy metals", "toxic chemicals", "parenting", "food scanner"],
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedCategory = (params.category as string) || "All";
  const searchQuery = (params.q as string) || "";

  const categories = ["All", ...getCategories()];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-brand-400 text-sm font-semibold">
                Baby Food Safety Blog
              </span>
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
              Parent's Guide to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-green-300">
                Baby Food Safety
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Expert advice, research, and actionable tips to protect your
              baby from hidden toxins in food.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <form action="/blog" method="get">
                <input
                  type="text"
                  name="q"
                  placeholder="Search articles..."
                  defaultValue={searchQuery}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Link
                key={category}
                href={
                  category === "All"
                    ? "/blog"
                    : `/blog?category=${encodeURIComponent(category)}`
                }
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-brand-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No articles found.</p>
              <Link
                href="/blog"
                className="inline-block mt-4 text-brand-600 hover:underline"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
                >
                  {/* Cover Image Placeholder - Gradient Background */}
                  <div className="relative h-48 bg-gradient-to-br from-brand-500 to-green-600 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 text-gray-900 border-0 px-3 py-1 text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{post.author.name}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                    >
                      Read Article
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Get Weekly Safety Tips
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join 24,000+ parents who receive our free newsletter with the latest
            baby food safety alerts and expert advice.
          </p>
          <Link href="/signup">
            <button
              type="button"
              className="bg-white text-brand-700 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl"
            >
              Subscribe for Free
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © 2025 FoodFactScanner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}