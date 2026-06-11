import type { Metadata } from "next";
import PriceClient from "./PriceClient";

export const metadata: Metadata = {
  title: "ПЕРШИЙ МІЛЬЙОН | Практична інвестиційна стратегія",
  description: "За 10 тижнів отримаєте персональну стратегію досягнення першого мільйону на інвестиціях навіть без досвіду в фінансах та інвестуванні.",
  openGraph: {
    title: "ПЕРШИЙ МІЛЬЙОН | Практичний курс з інвестицій",
    description: "Персональна стратегія досягнення першого мільйону на інвестиціях.",
    type: "website"
  }
};

export default function PricePage() {
  return <PriceClient />;
}
