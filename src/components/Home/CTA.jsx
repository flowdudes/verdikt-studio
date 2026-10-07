"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ButtonComponent from "../Resuable/ButtonComponent";
import { LineReveal } from "../Animations/gsapAnim";
import Select from "../Resuable/Select";
import ScrambleShader from "./ScrambleShader";

const BACKDROP = "/imgs/cta-img-og.png";

const PANEL = "#7C0B3E";

const CONTACT = [
  { label: "Email", value: "hello@verdikt.studio", href: "mailto:hello@verdikt.studio" },
  { label: "Mobile", value: "+91 265428736476", href: "tel:+91265428736476" },
];

const SERVICES = [
  "Webflow",
  "Motion and interaction",
  "Full rebuild",
  "Not sure yet",
];

function Field({ label, as: Tag = "input", className = "", controlClassName = "", ...props }) {
  return (
    <label
      className={`flex flex-col justify-center gap-[0.4vw] px-[1.6vw] py-[1.1vw] max-md:px-5 max-md:py-6 ${className}`}
    >
      <span className="font-mono text16 uppercase text-[#FF69B4] max-md:text-[10px]">
        {label}
      </span>
      <Tag
        {...props}
        className={`w-full text-[#DCDCDC] resize-none bg-transparent text20 t outline-none placeholder:text-[#DCDCDC] max-md:text-sm ${controlClassName}`}
      />
    </label>
  );
}

export default function CTA() {
  const [values, setValues] = useState({
    site: "",
    email: "",
    service: SERVICES[0],
    note: "",
  });

  const update = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Contact form", values);
  };

  return (
    <section
      id="contact"
      className="relative w-full h-screen bg-background px-[2vw] pt-[4vw] pb-[2vw] max-md:h-auto max-md:px-0 max-md:pt-12 max-md:pb-0"
    >
      <div className="relative w-full h-[85vh] my-auto overflow-hidden bg-primary max-md:h-full">
        <Image
          src={BACKDROP}
          alt=""
          fill
          sizes="96vw"
          className="object-cover brightness-75"
        />
        <ScrambleShader  />

        <div className="relative z-10 flex h-full flex-col justify-between p-[3vw] max-md:h-auto max-md:gap-16 max-md:px-[7%] max-md:py-20">
          <div className="w-[34vw] bg-background text-foreground max-md:w-full">
            <LineReveal
              as="h2"
              className="text48 font-medium px-[1.4vw] py-[1.2vw] max-md:px-5 max-md:py-4 font-pp text-[#0A0A0A] max-md:text-3xl"
            >
              Contact
            </LineReveal>

            <div className="flex border-t border-foreground/15 max-md:flex-col">
              {CONTACT.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex flex-1 flex-col gap-[0.5vw] px-[1.4vw] py-[1.1vw] max-md:px-5 max-md:py-4 ${
                    index ? "border-l border-foreground/15 max-md:border-l-0 max-md:border-t" : ""
                  }`}
                >
                  <span className="font-mono text16 text-foreground/60 max-md:text-[10px]">
                    {item.label}
                  </span>
                  <span className="text24 text-[#0A0A0A] max-md:text-sm">{item.value}</span>
                </Link>
              ))}
            </div>
          </div>

          <div
            className="flex justify-between w-[55vw] gap-[3vw] self-end p-[2vw] text-background max-md:w-full font-medium max-md:flex-col max-md:gap-6 max-md:p-6"
            style={{ backgroundColor: PANEL }}
          >
            <LineReveal as="h2" className="text48 shrink-0">
              Form
            </LineReveal>

            <form
              onSubmit={handleSubmit}
              className="flex w-[65%] flex-col border border-background/15 max-md:w-full"
            >
              <div className="flex border-b border-background/15 max-md:flex-col">
                <Field
                  label="Your site"
                  type="url"
                  name="site"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://"
                  value={values.site}
                  onChange={update("site")}
                  className="w-1/2 shrink-0 text16 text-[#DCDCDC] border-r border-background/15 max-md:w-full max-md:border-r-0 max-md:border-b"
                />
                <Field
                  label="Your email"
                  type="email"
                  name="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={values.email}
                  onChange={update("email")}
                  className="w-1/2 shrink-0 max-md:w-full"
                />
              </div>

              <Select
                label="What are you after"
                value={values.service}
                options={SERVICES}
                onChange={(service) =>
                  setValues((current) => ({ ...current, service }))
                }
                panel={PANEL}
                className="border-b border-background/15"
              />

              <input type="hidden" name="service" value={values.service} />

              <Field
                label="Short note"
                as="textarea"
                name="note"
                rows={2}
                placeholder="What did you build it with, and what is bugging you?"
                value={values.note}
                onChange={update("note")}
                panel={PANEL}
                className="border-b border-background/15"
              />

              <div className="p-[1.6vw] max-md:p-4">
                <ButtonComponent
                  type="submit"
                  text="Get the Verdict"
                  className="w-full bg-[#12000A]! text-[#DCDCDC]"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
