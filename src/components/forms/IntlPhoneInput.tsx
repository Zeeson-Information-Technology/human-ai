"use client";

import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import React from "react";
import styles from "./IntlPhoneInput.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
};

export default function IntlPhoneInput({
  value,
  onChange,
  placeholder = "Phone number",
  id,
  className = "",
}: Props) {
  return (
    <div id={id} className={["w-full", styles.phoneWrap, className].join(" ")}>
      <PhoneInput
        defaultCountry="us"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        hideDropdown={false}
        inputClassName="w-full bg-white text-gray-900"
        className={styles.phoneInner}
      />
    </div>
  );
}
