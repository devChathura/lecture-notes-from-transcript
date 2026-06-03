import React from 'react';

const Hero = () => {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 flex flex-col items-center text-center pt-[120px] pb-[60px]">
      {/* 1. THE GIANT HEADLINE */}
      <h1 className="font-sans text-[40px] md:text-[56px] lg:text-[64px] leading-[1.1] font-[650] text-[#141414] tracking-tight max-w-4xl mx-auto mb-6">
        Turn 2-Hour Lectures into<br className="hidden sm:block" /> 2-Minute Study Guides.
      </h1>

      {/* 2. THE SUBHEADLINE */}
      <p className="font-sans text-[16px] md:text-[20px] text-[#707070] font-[440] leading-[1.5] max-w-2xl mx-auto mb-10">
        Upload your raw transcripts and let our O(n) parsing pipeline synthesize them into structured Markdown notes. Built for the modern student.
      </p>

      {/* 3. THE BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button className="bg-[#141414] text-[#FFFFFF] font-semibold text-[16px] px-8 py-4 rounded-full hover:bg-[#000000] hover:scale-[1.02] transition-all duration-200">
          Start Generating
        </button>
        <button className="bg-transparent text-[#141414] font-semibold text-[16px] px-8 py-4 rounded-full border border-[#C2C2C2] hover:bg-[#F5F5F5] transition-all duration-200 flex items-center gap-2">
          View Architecture <span>&rarr;</span>
        </button>
      </div>

      {/* 4. THE SOCIAL PROOF / VALUE PROP */}
      <div className="mt-16 flex flex-col items-center">
        <p className="font-sans text-[14px] text-[#ADADAD] font-medium mb-2">
          Save hundreds of hours of studying time
        </p>
        <p className="text-[#707070] text-[16px] font-semibold opacity-80 text-center">
          Instead of stopping the lecture 100 times to take notes.
        </p>
      </div>
    </div>
  );
};

export default Hero;
