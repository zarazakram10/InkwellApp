import { LandingCta } from "@/components/LandingCta";
import { SiteHeader } from "@/components/SiteHeader";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col px-6 py-20">
        <p className="font-sans text-xs uppercase tracking-[0.28em] text-muted">
          A quiet writing studio
        </p>
        <h1 className="mt-4 max-w-2xl text-5xl leading-[1.15] tracking-tight md:text-6xl">
          Write with your sources at hand, and a partner that uses them.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
          Folio keeps the page in the center, your knowledge in the margin, and
          an editor who can draft or revise from those notes as you go.
        </p>
        <LandingCta />
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "The page",
              body: "A calm rich-text desk with classic serif type and a paper-like page.",
            },
            {
              title: "The notes",
              body: "Add plain-text knowledge beside the document. Folio uses it as context.",
            },
            {
              title: "The partner",
              body: "Ask the assistant to write or edit the document from those sources.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-line bg-card p-5 shadow-soft"
            >
              <h2 className="text-xl">{item.title}</h2>
              <p className="mt-2 leading-7 text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
