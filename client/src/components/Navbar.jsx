import React from 'react';

const Navbar = () => {
  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between bg-[#EDEDED]/72 backdrop-blur-md rounded-full px-6 py-2 mx-4 w-full max-w-3xl shadow-sm border border-[#EDEDED]/50">
        {/* Left Side (Logo) */}
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#141414"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          <span className="font-sans font-bold text-[#141414] text-[16px] tracking-tight">
            Lecture Companion
          </span>
        </div>

        {/* Right Side (Links) */}
        <div className="flex items-center gap-1">
          <a
            href="#features"
            className="font-sans text-[16px] text-[#141414] px-4 py-2 rounded-full transition-all duration-200 hover:bg-[#EDEDED]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="font-sans text-[16px] text-[#141414] px-4 py-2 rounded-full transition-all duration-200 hover:bg-[#EDEDED]"
          >
            How it works
          </a>
          <a
            href="https://github.com/devChathura"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[16px] text-[#141414] px-4 py-2 rounded-full transition-all duration-200 hover:bg-[#EDEDED]"
          >
            GitHub
          </a>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
