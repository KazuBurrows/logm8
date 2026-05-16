import React from "react";
import { Section } from "../components/common/Section";
import { useNavigate } from "react-router-dom";

import logmateLogo from "../assets/logm8logo3.png"; // ✅ Correct path

export default function Privacy() {
    const navigate = useNavigate();

    const handleRedirect = () => {
        navigate(`/`);
    };
    return (
        <Section
            id={"privacy"}
            className="h-full xl:px-36 lg:px-12 md:px-8 sm:px-4 lg:pt-24 pt-16"
        >
            <div className="max-w-4xl mx-auto px-6 pb-16">
                <div className="flex justify-center">
  <button
    onClick={handleRedirect}
    aria-label="Back to Homepage"
  >
    <img
  src={logmateLogo}
  className="max-h-24 mx-auto my-8"
  alt="Logmate Logo"
/>
  </button>
</div>
                <h2 className="text-4xl font-bold mb-8 text-center lexend-font">
                    Privacy Policy
                </h2>

                <div className="space-y-8 text-gray-700 text-lg leading-relaxed">
                    <section>
                        <h3 className="text-2xl font-semibold mb-3">Introduction</h3>
                        <p>
                            At logm8, we value your privacy. This page explains how we collect,
                            use, and protect your information when you use our app and
                            services.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold mb-3">Information We Collect</h3>
                        <p>
                            We only collect the information that you choose to provide to us.
                            This may include logbook entries, receipts, service records, and
                            other documents you upload to maintain your vehicle’s history. No
                            additional personal data is gathered, and viewing a logbook does
                            not require you to share any information.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold mb-3">How We Use Your Data</h3>
                        <p>
                            Your data is used solely to maintain your vehicle’s digital
                            history. We do not sell or share your information with third
                            parties. Access is limited to you and those you authorize.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold mb-3">Security</h3>
                        <p>
                            logm8 uses encryption and secure authentication to protect your
                            data. We continuously update our systems to safeguard against
                            unauthorized access.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold mb-3">Your Rights</h3>
                        <p>
                            You can update or delete your logbook entries at any time. To ensure
                            proper control, we apply custom authorization rules that allow
                            vehicle owners to manage logs, even if those entries were created by
                            others in the past. If you transfer your vehicle, the logbook stays
                            linked to the logm8 sticker and will be accessible to the new owner.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold mb-3">Contact Us</h3>
                        <p>
                            If you have questions about this Privacy Policy, please contact us
                            at <span className="font-medium">support@logm8.com</span>.
                        </p>
                    </section>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-300 mt-12 pt-6 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} logm8. All rights reserved.
                </div>
            </div>
        </Section>
    );
}