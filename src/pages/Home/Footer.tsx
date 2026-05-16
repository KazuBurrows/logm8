import { Section } from "../../components/common/Section";

type FooterLink = {
  title: string;
  description: string;
  href: string;
};

const footerLinks: FooterLink[] = [
  {
    title: "Company",
    description: "Learn more about logm8 and our mission.",
    href: "/company",
  },
  {
    title: "Support",
    description: "Get help, FAQs, and contact information.",
    href: "/faq",
  },
  {
    title: "Privacy",
    description: "Read our privacy policy and terms of service.",
    href: "/privacy",
  },
];

export default function Footer() {
  return (
    <Section
      id={"footer"}
      className="h-full xl:px-36 lg:px-12 md:px-8 sm:px-4 lg:pt-24 pt-16 bg-slate-200"
    >
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8 px-6 pb-16">
        {footerLinks.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col justify-start items-start p-6 xl:shadow-lg ${
              index % 2 === 1 ? "bg-blue-50" : "bg-white"
            }`}
          >
            <h3 className="lg:text-2xl md:text-xl text-lg font-semibold lexend-font mb-3">
              {item.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{item.description}</p>
            <a
              href={item.href}
              className="text-blue-600 hover:text-red-600 font-medium"
            >
              Learn more →
            </a>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} logm8. All rights reserved.
      </div>
    </Section>
  );
}