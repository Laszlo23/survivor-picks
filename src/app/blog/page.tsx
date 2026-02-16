"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import {
  BLOG_POSTS,
  BLOG_CATEGORIES,
  getFeaturedPosts,
  type BlogCategory,
} from "@/lib/blog-data";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<
    "All Posts" | BlogCategory
  >("All Posts");

  const featured = getFeaturedPosts();
  const filtered =
    activeCategory === "All Posts"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/[0.04] to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neon-cyan">
            The Picks Blog
          </p>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold leading-tight">
            Stories From
            <br />
            <span className="text-gradient-cyan">The Community</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Prediction wins, reality TV breakdowns, and the stories behind the
            most accurate community in crypto.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group relative flex flex-col rounded-xl border border-white/[0.06] bg-card/60 p-5 transition-all hover:border-neon-cyan/20 hover:shadow-neon-cyan"
            >
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-neon-gold" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neon-gold">
                  Featured
                </span>
                <span className="text-[10px] text-muted-foreground">
                  &middot;
                </span>
                <span className="text-[10px] font-medium text-neon-cyan">
                  {post.category}
                </span>
              </div>
              <h3 className="text-lg font-bold leading-snug group-hover:text-neon-cyan transition-colors">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {post.description}
              </p>
              <div className="mt-auto flex items-center gap-3 pt-5 text-xs text-muted-foreground">
                <span>{post.date}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neon-cyan opacity-0 transition-opacity group-hover:opacity-100">
                Read <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Category Filter + All Posts */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        {/* Filter tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {(["All Posts", ...BLOG_CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
                  : "bg-white/[0.04] text-muted-foreground border border-white/[0.06] hover:text-foreground hover:border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Post grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-xl border border-white/[0.06] bg-card/40 p-5 transition-all hover:border-neon-cyan/20 hover:bg-card/60"
            >
              <span className="mb-2 text-[10px] font-medium text-neon-cyan">
                {post.category}
              </span>
              <h3 className="text-base font-bold leading-snug group-hover:text-neon-cyan transition-colors">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {post.description}
              </p>
              <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground">
                <span>{post.date}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            No posts in this category yet.
          </p>
        )}
      </section>
    </main>
  );
}
