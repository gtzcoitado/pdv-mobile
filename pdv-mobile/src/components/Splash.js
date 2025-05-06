// src/components/Splash.js
import React, { useEffect } from "react";
import logo from "../assets/new-rift-logo.png"; // adjust path to your PNG

export default function Splash({ onFinish }) {
  useEffect(() => {
    const t = setTimeout(onFinish, 3000);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div
        className="p-6 rounded-full bg-black animate-logo-techno"
        style={{ boxShadow: "0 0 30px rgba(59,130,246,0.7)" }}
      >
        <img src={logo} alt="New Rift Technology" className="w-48 h-48" />
      </div>
    </div>
  );
}
