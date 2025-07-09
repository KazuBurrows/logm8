// import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// import { Section } from "../componets/Section";
import logmateLogo from "../assets/logm8logo3.png"; // ✅ Correct path


interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is Logm8?",
    answer:
      "Logm8 is a lightweight digital logbook for automobiles. It lets you keep a record of your vehicle’s history by scanning a Logm8 sticker attached to your vehicle.",
  },
  {
    question: "How does the Logm8 sticker work?",
    answer:
      "Each Logm8 sticker contains a unique code. When scanned through the Logm8 app, it connects your phone to your vehicle's digital logbook via your browser.",
  },
  {
    question: "Is the Logm8 app free?",
    answer:
      "Yes, the Logm8 app is free to download and use. It’s designed to be lightweight and easy to use.",
  },
  {
    question: "Can I transfer my logbook to a new owner?",
    answer:
      "Yes! The Logm8 logbook stays with the vehicle. When the vehicle changes hands, the logbook can be accessed and continued by the new owner.",
  },
  {
    question: "What can I store in my digital logbook?",
    answer:
      "You can store receipts, service records, oil changes, WOFs, registration details, and other important vehicle documents.",
  },
  {
    question: "Do I need an account to use Logm8?",
    answer:
      "No account is required to scan a sticker and view a vehicle logbook. For uploading and editing entries, a secure login is required.",
  },
];
export default function Privacy() {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate(`/`);
  };

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <button
        onClick={handleRedirect}
        aria-label="Back to Homepage"
      >
        <img
          src={logmateLogo}
          className="inline sm:h-24 sm:w-24 h-20 w-20 mx-2 my-8"
          alt="Logmate Logo"
        />
      </button>
      <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border rounded-xl overflow-hidden shadow-sm"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 focus:outline-none flex justify-between items-center"
            >
              <span className="font-medium">{faq.question}</span>
              <span className="text-xl">{openIndex === index ? "−" : "+"}</span>
            </button>
            {openIndex === index && (
              <div className="px-4 py-3 bg-white text-gray-700 transition-all duration-300">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>


  );
}
