import type { Metadata } from "next";
import IntensiveClient from "./IntensiveClient";

export const metadata: Metadata = {
  title: "Безкоштовний інтенсив з інвестицій | Софія Федуняк",
  description: "Дізнайтеся, як розпочати інвестувати, накопичити перші 100 000$ та стабільно отримувати пасивний дохід навіть під час кризи.",
  openGraph: {
    title: "Безкоштовний інтенсив з інвестицій | Софія Федуняк",
    description: "Накопичте перші 100 000$ на інвестиціях навіть під час кризи.",
    type: "website"
  }
};

export default function IntensivePage() {
  return <IntensiveClient />;
}
