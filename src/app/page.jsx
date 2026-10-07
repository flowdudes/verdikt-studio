import React from 'react';
import Hero from '@/components/Home/Hero';
import TheGap from '@/components/Home/TheGap';
import TakeAllOfIt from '@/components/Home/TakeAllofIt';
import StripTransition from '@/components/Resuable/StripTransition';
import StripScaleReveal from '@/components/Resuable/StripScaleReveal';
import Comparision from '@/components/Home/Comparision';
import Work from '@/components/Home/Work';
import BeforeAfter from '@/components/Home/BeforeAfter'; 
import Process from '@/components/Home/Process';

import SectionBreak from '@/components/Home/SectionBreak';
import CTA from '@/components/Home/CTA'; 
import Footer from '@/components/Home/Footer';

export default function Page() { 
  return (
    <>
      <Hero />
      <StripTransition />
      <TheGap />
      <StripTransition
        color="bg-white"
        className="mt-[-80vw]! z-99! max-md:mt-[-70vh]!"
        start="18% 5%"
        end="120% bottom"
      />
      <TakeAllOfIt />
      <Comparision />
      <BeforeAfter />
      <Process />
      <StripScaleReveal />
      <Work />
      <SectionBreak />
      <CTA />
      <Footer />
    </>
  );
}
