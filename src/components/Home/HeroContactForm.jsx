"use client";

import React, { useState } from "react";
import ButtonComponent from "../Resuable/ButtonComponent";

function Field({ label, ...props }) {
  return (
    <label className="flex min-h-20 flex-1 flex-col items-start justify-center gap-[0.5vw] bg-secondary px-[1.7vw] py-[1vw] max-md:min-h-0 max-md:w-full max-md:gap-[1.5vw] max-md:px-[7%] max-md:py-[4vw]">
      <span className="font-mono text16 uppercase text-primary">
        {label}
      </span>
      <input
        {...props}
        className="w-full bg-transparent text20 text-background outline-none placeholder:text-[#DCDCDC]"
      />
    </label>
  );
}

export default function HeroContactForm() {
  const [values, setValues] = useState({ site: "", email: "" });

  const update = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Hero contact form", values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-stretch gap-px max-md:flex-col"
    >
      <Field
        label="Your site"
        type="url"
        name="site"
        inputMode="url"
        autoComplete="url"
        placeholder="https://"
        value={values.site}
        onChange={update("site")}
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
      />

      <div className="flex px-[1.25vw] bg-secondary min-w-[18vw] items-center justify-center max-md:min-w-0 max-md:w-full max-md:px-[7%] max-md:py-[4vw]">


        <ButtonComponent
          type="submit"
          text="Get the Verdict"
          className="w-full"
        />
      </div>
    </form>
  );
}
