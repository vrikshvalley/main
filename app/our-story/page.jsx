'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { setStickyHeaderData } from '@/lib/stickyHeaderStore';
import { useSplitType } from '@/lib/hooks/useSplitType';
import '@/styles/pages.scss';

export default function OurStory() {
  const bannerRef = useSplitType('.hero-banner h1', { delay: 0.1, stagger: 0.05, duration: 0.7 });

  useEffect(() => {
    setStickyHeaderData({ title: "Our Story", subtitle: "A journey from concrete to green" });
    return () => setStickyHeaderData({ title: null, subtitle: null });
  }, []);

  return (
    <div className="page-container">
      
      {/* Hero Banner */}
      <div className="hero-banner" ref={bannerRef}>
        <picture>
          <source 
            media="(max-width: 768px)" 
            srcSet="/OurStoryMobile.png" 
          />
          <Image
            src="/OurStoryDesktop.png"
            alt="Our Story - Vriksh Valley"
            fill
            priority
            className="hero-image"
            style={{ objectFit: 'cover' }}
          />
        </picture>
        <div className="hero-overlay">
          <h1>Our Story</h1>
          <p>A journey from concrete to green</p>
        </div>
      </div>

      <Breadcrumbs items={[{ label: 'Our Story' }]} />
      
      <div className="page-content">

        <div className="content-section">
          <h2>The Origin</h2>
          <p>
            In the heart of Kolkata's bustling streets, where concrete towers kissed the sky and green seemed like a fading memory, a young mind dreamed of something different. Urban life was comfortable, predictable—but nature always whispered from somewhere far away, calling out like a song forgotten but never unheard.
          </p>

          <h2>The Awakening</h2>
          <p>
            Then came 2019. A move to Ranchi for high school became the moment everything changed. Away from the city's endless noise, amidst rolling hills and quieter mornings, something awakened. Plants weren't just decorations anymore—they were conversations. Gardens weren't just spaces; they were sanctuaries. With soil under fingernails and questions blooming as fast as flowers, a deep love for agriculture, plants, and horticulture took root.
          </p>

          <h2>The Problem</h2>
          <p>
            But there was a problem. Every visit to a local nursery felt incomplete. The plants arrived home and slowly faded, their beauty wilting like forgotten promises. The nursery owners couldn't explain why. They didn't know how to revive a struggling Monstera or coax life back into browning leaves. Care instructions were vague, prices were steep, and the journey to reach them was exhausting. During those long commutes, a frustration grew—and with it, a spark of an idea:
          </p>
          <p style={{ fontStyle: 'italic', margin: '1.5rem 0', fontSize: '1.1rem' }}>
            What if there was a different way? What if plants could come with knowledge, with care, with someone who truly understood them?
          </p>

          <h2>The Dream Takes Root</h2>
          <p>
            The idea lived quietly for years, tucked away in a corner of the mind like a seed waiting for the right season. High school ended. A return to Kolkata came next, with university halls and city life resuming. But Ranchi's green hills didn't disappear—they stayed, vivid and alive in memory. Nature kept calling, growing louder with each passing year.
          </p>

          <h2>The Birth of Vriksh Valley</h2>
          <p>
            Then came 2024. Something shifted. The idea that had been sleeping suddenly felt urgent, alive, impossible to ignore. What started as a whisper became a purpose. Months of research followed. Countless journeys across India, learning from farmers, horticulturists, and growers. Late nights studying plant science. Endless hours sourcing varieties from different regions, understanding their needs, their stories, their secrets. Every conversation, every soil sample, every seedling was a lesson in how to do things differently.
          </p>
          <p>
            Finally, on <strong>October 26th, 2025</strong>, Vriksh Valley was born.
          </p>

          <h2>More Than E-commerce</h2>
          <p>
            This isn't just another e-commerce platform. This is a garden centre reimagined for everyone, everywhere across India. Here, every plant comes with knowledge, not just a price tag. Every seedling is chosen with care because we know what it feels like when a plant doesn't make it home. We source authentically from across India—not shortcuts, not compromises, just the real thing, grown the right way.
          </p>

          <h2>Our Mission</h2>
          <p>
            We exist because we remember what it was like to feel disconnected from nature, even while loving it. We understand the frustration of losing plants, of not knowing why they're struggling, of feeling like gardening was only for experts. We know what it's like to crave green spaces but feel trapped by distance and doubt.
          </p>
          <p>
            But we also believe something else: that nature belongs to everyone. That a teenager in Kolkata should have the same access to thriving plants as someone in Ranchi. That gardening shouldn't be expensive, complicated, or lonely. That when you bring home a plant from Vriksh Valley, it thrives not just because it's healthy when it arrives, but because you know how to care for it, you have us to turn to when questions arise, and most importantly—you're part of something bigger.
          </p>

          <h2>A Movement, Not Just a Store</h2>
          <p>
            You're part of a movement to bring the green back. Vriksh Valley is where the urban dreamer and the nature lover finally meet. It's where love for plants translates into action. It's where every customer becomes a caretaker of something living, something growing, something that gives back as much as they give.
          </p>
          <p style={{ fontWeight: 600, marginTop: '2rem', fontSize: '1.1rem' }}>
            Our story is your story too—of rediscovering nature, of coming home to green, of remembering that we were never meant to live in concrete alone.
          </p>
          <p style={{ fontWeight: 700, marginTop: '2rem', fontSize: '1.2rem', color: '#2d5016' }}>
            Welcome to Vriksh Valley. Let's grow together.
          </p>
        </div>
      </div>
    </div>
  );
}
