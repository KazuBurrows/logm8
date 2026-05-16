import React, { useState } from "react";
import { Section } from "../components/common/Section";
import { useApi } from "../api/useApi";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const { post, loading } = useApi();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.name) newErrors.push("Name is required.");
    if (!formData.email) newErrors.push("Email is required.");
    if (!formData.message) newErrors.push("Message is required.");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await post("EmailItem", {
        fromEmail: formData.email,
        fromName: formData.name,
        message: formData.message,
      });
      alert("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
      setErrors([]);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Something went wrong. Please try again."]);
    }
  };

  return (
    <Section id="contact" className="h-screen lg:py-24 md:py-16 sm:py-12 py-20">
      <div className="lg:w-9/12 w-full text-center mx-auto lg:mb-24 mb-16 xl:px-18 lg:px-4 md:px-8 px-6">
        <h2 className="text-7xl funnel-display-font font-semibold text-center">
          Contact Us
        </h2>
        <h3 className="lg:text-3xl md:text-xl sm:text-lg text-2xl lexend-font font-light text-gray-700 text-center">
          Our team will get back to you real soon.
        </h3>
      </div>
      <div className="xl:w-9/12 w-full mx-auto sm:p-16 p-8 bg-white xl:shadow-lg xl:rounded-lg lexend-font">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:gap-6 gap-0">
          {/* Left Column - Form Fields */}
          <div>
            {errors.length > 0 && (
              <div className="mb-4">
                <ul className="text-red-600 list-disc pl-5">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 mt-1 border-b-[2px] border-gray-300 focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 mt-1 border-b-[2px] border-gray-300 focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Your email"
                  required
                />
              </div>

              {/* <div>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-3 mt-1 border-b-[2px] border-gray-300 focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Subject"
                  required
                />
              </div> */}

              <div>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-3 mt-1 border-b-[2px] border-gray-300 focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Your message"
                  rows={5}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </form>
          </div>

          {/* Right Column - Static Info */}
          <div className="space-y-4 ml-16 md:block hidden">
            <ul className="text-gray-700">
              <li className="flex md:flex-col items-left my-4">
                <span className="text-3xl font-semibold">Email:</span>
                <span className="text-2xl">contact@company.com</span>
              </li>
              <li className="flex md:flex-col items-left my-4">
                <span className="text-3xl font-semibold">Mobile:</span>
                <span className="text-2xl">(123) 456-7890</span>
              </li>
              <li className="flex md:flex-col items-left my-4">
                <span className="text-3xl font-semibold">Address:</span>
                <span className="text-2xl">1234 Main St, City, Country</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
