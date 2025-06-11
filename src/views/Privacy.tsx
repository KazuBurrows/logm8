import React from "react";
import { useNavigate } from "react-router-dom";

import { Section } from "../componets/Section";
// import logmateLogo from "../assets/logmate-logo.png";

export default function Privacy() {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate(`/`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <a
        onClick={handleRedirect}
        className="text-rose-500 hover:underline cursor-pointer"
      >
        <img
          src="../assets/logmate-logo.png"
          className="inline sm:h-28 sm:w-28 h-20 w-20 rounded-full mx-2"
          alt="Logmate Logo"
        />
      </a>
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last Updated: 25/02/2025</p>
      <p className="mt-4">
        Welcome to Logm8. Your privacy is
        important to us, and we are committed to protecting the personal
        information you share with us. This Privacy Policy explains how we
        collect, use, disclose, and safeguard your information when you visit
        our website www.logm8.com.
      </p>

      <h2 className="text-xl font-semibold mt-6">1. Information We Collect</h2>
      <ul className="list-disc pl-6 mt-2">
        <li>
          <strong>Personal Information</strong>: Name, email address, phone
          number, and any other details you provide when contacting us or
          signing up for services.
        </li>
        <li>
          <strong>Usage Data</strong>: Information about how you interact with
          our website, including IP address, browser type, device information,
          and pages visited.
        </li>
        <li>
          <strong>Cookies and Tracking Technologies</strong>: We use cookies and
          similar technologies to enhance user experience and analyze website
          traffic. You can manage cookie preferences in your browser settings.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">
        2. How We Use Your Information
      </h2>
      <ul className="list-disc pl-6 mt-2">
        <li>Provide, operate, and maintain our website.</li>
        <li>Improve user experience and customer service.</li>
        <li>Respond to inquiries and provide support.</li>
        <li>
          Send promotional or informational communications (you may opt out at
          any time).
        </li>
        <li>Ensure compliance with legal obligations.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">
        3. Sharing Your Information
      </h2>
      <p className="mt-2">
        We do not sell or rent your personal information. However, we may share
        your information with:
      </p>
      <ul className="list-disc pl-6 mt-2">
        <li>
          <strong>Service Providers</strong>: Third-party companies that assist
          in website operation and analytics.
        </li>
        <li>
          <strong>Legal Compliance</strong>: When required by law, or to protect
          our rights and safety.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">4. Data Security</h2>
      <p className="mt-2">
        We implement security measures to protect your personal information from
        unauthorized access, alteration, or disclosure. However, no internet
        transmission is completely secure, and we cannot guarantee absolute
        security.
      </p>

      <h2 className="text-xl font-semibold mt-6">5. Your Rights and Choices</h2>
      <ul className="list-disc pl-6 mt-2">
        <li>Access, update, or delete your personal information.</li>
        <li>Opt-out of marketing communications.</li>
        <li>Disable cookies through browser settings.</li>
        <li>Request data portability where applicable.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">6. Third-Party Links</h2>
      <p className="mt-2">
        Our website may contain links to external sites. We are not responsible
        for their privacy practices and encourage you to review their policies.
      </p>

      <h2 className="text-xl font-semibold mt-6">7. Changes to This Policy</h2>
      <p className="mt-2">
        We may update this Privacy Policy periodically. Any changes will be
        posted on this page with the updated date.
      </p>

      <h2 className="text-xl font-semibold mt-6">8. Contact Us</h2>
      <p className="mt-2">
        If you have any questions about this Privacy Policy, please contact us
        at:
      </p>
      <p className="mt-2"> postmaster@logm8.com</p>

      <p className="mt-6">
        By using our website, you consent to the terms of this Privacy Policy.
      </p>
    </div>
  );
}
