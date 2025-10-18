"use client";

import React, { useState } from "react";
import Container from "./ui/Container";
import Input from "./ui/Input";
import Button from "./ui/Button";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
      if (!formspreeId) {
        throw new Error("Formspree ID not configured");
      }

      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        throw new Error("Failed to submit form");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-12 sm:py-16">
      <Container className="px-4">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/70 bg-white/50 backdrop-blur-xl p-8 sm:p-10 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 [html[data-theme='dark']_&]:border-slate-700/70 [html[data-theme='dark']_&]:bg-slate-800/50 [html[data-theme='dark']_&]:shadow-slate-900/20 [html[data-theme='dark']_&]:hover:shadow-slate-900/30">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-tight [html[data-theme='dark']_&]:text-slate-50">
              Get in touch
            </h2>
            <p className="mt-2 text-base text-slate-600 [html[data-theme='dark']_&]:text-slate-400">
              Have questions or feedback? We&apos;d love to hear from you.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-900 mb-2 [html[data-theme='dark']_&]:text-slate-100"
              >
                Name
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
                variant="glass"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-900 mb-2 [html[data-theme='dark']_&]:text-slate-100"
              >
                Email
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                variant="glass"
              />
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-slate-900 mb-2 [html[data-theme='dark']_&]:text-slate-100"
              >
                Subject
              </label>
              <Input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What's this about?"
                variant="glass"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-slate-900 mb-2 [html[data-theme='dark']_&]:text-slate-100"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Tell us what's on your mind..."
                className="w-full rounded-xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-slate-300 px-4 py-3 bg-white/80 border border-slate-200/70 backdrop-blur-xl [html[data-theme='dark']_&]:text-slate-100 [html[data-theme='dark']_&]:placeholder:text-slate-400 [html[data-theme='dark']_&]:focus:border-slate-600 [html[data-theme='dark']_&]:bg-slate-800/80 [html[data-theme='dark']_&]:border-slate-700/70 resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              variant="secondary"
              className="w-full mt-6 rounded-full bg-slate-900 hover:bg-slate-800 [html[data-theme='dark']_&]:bg-slate-100 [html[data-theme='dark']_&]:hover:bg-slate-200"
            >
              {isSubmitting ? "Sending..." : "Send message"}
            </Button>

            {/* Success Message */}
            {submitted && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 [html[data-theme='dark']_&]:bg-emerald-950/30 [html[data-theme='dark']_&]:border-emerald-900/50">
                <p className="text-sm font-medium text-emerald-900 [html[data-theme='dark']_&]:text-emerald-200">
                  ✓ Message sent! We&apos;ll get back to you soon.
                </p>
              </div>
            )}
          </form>
        </div>
      </Container>
    </section>
  );
};

export default ContactForm;
