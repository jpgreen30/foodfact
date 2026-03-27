import { notFound } from "next/navigation";
import { blogPosts, getBlogPostBySlug } from "@/data/blogPosts";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | FoodFactScanner",
    };
  }

  return {
    title: post.seo.title,
    description: post.seo.description,
    keywords: post.seo.keywords,
    openGraph: {
      title: post.seo.title,
      description: post.seo.description,
      type: "article",
      publishedTime: post.publishedAt,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-transparent border border-white/30 text-white hover:bg-white/10 mb-6 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Blog
            </Link>

            {/* Category & Date */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="bg-brand-500 text-white px-3 py-1 rounded-full text-sm">
                {post.category}
              </span>
              <div className="flex items-center gap-1 text-gray-300">
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-2xl text-gray-300 mb-6">{post.excerpt}</p>

            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center font-bold">
                {post.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="font-semibold">{post.author.name}</p>
                <p className="text-sm text-gray-400">Expert Team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Cover Image */}
              {post.coverImage && (
                <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    width={1200}
                    height={630}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Article Content */}
              <article className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900">
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </article>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-12 bg-gradient-to-br from-brand-50 to-green-50 rounded-2xl p-8 border-2 border-brand-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Protect Your Baby Today
                </h3>
                <p className="text-gray-700 mb-6">
                  FoodFactScanner helps you detect hidden toxins in baby food
                  instantly. Scan any product and get real safety scores.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/signup"
                    className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-6 rounded-xl text-center transition-colors"
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    href="/blog"
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl text-center transition-colors"
                  >
                    Read More Articles
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Table of Contents */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Table of Contents</h3>
                  <nav className="space-y-2">
                    {post.content
                      .split("\n")
                      .filter((line) => line.startsWith("## "))
                      .map((heading, idx) => {
                        const headingText = heading.replace("## ", "");
                        const anchor = headingText
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "");
                        return (
                          <a
                            key={idx}
                            href={`#${anchor}`}
                            className="block text-gray-600 hover:text-brand-600 text-sm py-1"
                          >
                            {headingText}
                          </a>
                        );
                      })}
                  </nav>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Related Articles</h3>
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <div key={relatedPost.slug}>
                          <Link
                            href={`/blog/${relatedPost.slug}`}
                            className="text-brand-600 hover:text-brand-700 font-medium text-sm mb-1 block"
                          >
                            {relatedPost.title}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {formatDate(relatedPost.publishedAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Sidebar */}
                <div className="bg-gradient-to-br from-brand-600 to-green-600 rounded-2xl p-6 text-white">
                  <h4 className="font-bold text-lg mb-2">Free Baby Food Safety Checker</h4>
                  <p className="text-white/90 text-sm mb-4">
                    Scan any baby food product with our mobile app.
                  </p>
                  <Link
                    href="/signup"
                    className="block w-full text-center bg-white text-brand-700 hover:bg-gray-100 font-medium py-3 px-4 rounded-xl transition-colors"
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Related Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.slug}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <div className="h-40 bg-gradient-to-br from-brand-500 to-green-600"></div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(relatedPost.publishedAt)}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

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