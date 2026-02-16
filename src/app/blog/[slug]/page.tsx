import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-data";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — RealityPicks Blog`,
    description: post.description,
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const currentIdx = BLOG_POSTS.findIndex((p) => p.slug === params.slug);
  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== params.slug && p.category === post.category
  ).slice(0, 2);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="relative border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/[0.03] to-transparent" />
        <div className="relative mx-auto max-w-3xl px-4 pt-16 pb-10">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <div className="mb-4 flex items-center gap-3 text-xs">
            <span className="rounded-full bg-neon-cyan/10 px-3 py-1 font-semibold text-neon-cyan border border-neon-cyan/20">
              {post.category}
            </span>
            <span className="text-muted-foreground">{post.date}</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-headline font-bold leading-tight">
            {post.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {post.description}
          </p>
        </div>
      </section>

      {/* Article content */}
      <article className="mx-auto max-w-3xl px-4 py-12">
        <div className="prose-blog space-y-5 text-[15px] leading-relaxed text-foreground/90">
          {post.content.map((block, i) => {
            if (block.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="mt-10 mb-4 text-2xl font-headline font-bold text-foreground"
                >
                  {block.replace("## ", "")}
                </h2>
              );
            }
            if (block.startsWith("### ")) {
              return (
                <h3
                  key={i}
                  className="mt-6 mb-2 text-lg font-bold text-foreground"
                >
                  {block.replace("### ", "")}
                </h3>
              );
            }
            if (block.includes("\n- ") || block.startsWith("- ")) {
              const lines = block.split("\n").filter(Boolean);
              return (
                <ul key={i} className="space-y-2 pl-5 list-disc marker:text-neon-cyan/60">
                  {lines.map((line, j) => (
                    <li key={j} className="text-foreground/80">
                      {renderInlineMarkdown(line.replace(/^-\s*/, ""))}
                    </li>
                  ))}
                </ul>
              );
            }
            if (/^\d+\.\s\*\*/.test(block) || block.includes("\n1. ")) {
              const lines = block.split("\n").filter(Boolean);
              return (
                <ol key={i} className="space-y-2 pl-5 list-decimal marker:text-neon-cyan/60">
                  {lines.map((line, j) => (
                    <li key={j} className="text-foreground/80">
                      {renderInlineMarkdown(
                        line.replace(/^\d+\.\s*/, "")
                      )}
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <p key={i} className="text-foreground/80">
                {renderInlineMarkdown(block)}
              </p>
            );
          })}
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-white/[0.06] bg-card/30">
          <div className="mx-auto max-w-3xl px-4 py-12">
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Keep Reading
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="group flex flex-col rounded-xl border border-white/[0.06] bg-card/60 p-5 transition-all hover:border-neon-cyan/20"
                >
                  <span className="mb-1 text-[10px] font-medium text-neon-cyan">
                    {rp.category}
                  </span>
                  <h4 className="text-sm font-bold leading-snug group-hover:text-neon-cyan transition-colors">
                    {rp.title}
                  </h4>
                  <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {rp.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to blog CTA */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neon-cyan hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            All Blog Posts
          </Link>
        </div>
      </section>
    </main>
  );
}

/** Render bold and italic inline markdown */
function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
