"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/general/Breadcrumbs";
import "../../styles/pages.scss";

export default function WhereNatureMeetsNurturePage() {
  return (
    <div className="page-container">
      {/* Hero Banner */}
      {/* Hero Banner */}
      <div className="hero-banner">
        <picture>
          <source 
            media="(max-width: 768px)" 
            srcSet="/NatureMeetsMobile.png" 
          />
          <Image
            src="/NatureMeetsDesktop.png"
            alt="Where Nature Meets Nurture - Vriksh Valley"
            fill
            priority
            className="hero-image"
            style={{ objectFit: 'cover' }}
          />
        </picture>
        <div className="hero-overlay">
          <h1>Where Nature Meets Nurture</h1>
          <p>A Journey Home to Green</p>
        </div>
      </div>

      <Breadcrumbs items={[{ label: 'Where Nature Meets Nurture' }]} />
      
      <div className="page-content">
        <section className="content-section">
          <p>
            I remember life in Kolkata's bustling streets as a young dreamer, craving the quiet whispers of the forest. In 2019, a move to Ranchi unlocked something deep inside me. I realized plants weren't just decorations anymore—they were conversations, and gardens weren't just spaces, they were sanctuaries. That awakening planted the seed for Vriksh Valley. Through long walks among dew-drenched leaves and dusty nurseries, I understood that every leaf has a story and every gardener needs a friend.
          </p>
          <p>
            When plants arrived home and slowly faded, their beauty wilting like forgotten promises, it felt like a tragedy. It wasn't enough to sell a plant and wish it well; it needed more—a nurturing hand, a listening ear, and clear guidance. I often asked myself: what if plants could come with knowledge, with care, with someone who truly understood them? That question lived quietly in my heart until finally in 2025 it became my mission to change the way we care for green.
          </p>
        </section>

        <section className="content-section">
          <h2>Handpicked, Heartfelt Care</h2>
          <p>
            At Vriksh Valley, we are caretakers at heart. We travel from lush hills to local farms across India to handpick the healthiest, happiest plants—each nurtured by nature and experts alike. Every plant we send comes with knowledge, not just a price tag, because a healthy plant deserves more than just delivery—it deserves love and attention. Each seedling is chosen with care, because we know what it feels like when a plant doesn't make it home. We source authentically from diverse regions, with no shortcuts or compromises, so you get the real thing, grown the right way.
          </p>
          <ul>
            <li><strong>Expertly Curated Plants:</strong> We vet each plant by soil, climate and origin to ensure you receive only the healthiest specimens for your space.</li>
            <li><strong>Guides & Tutorials:</strong> Every plant arrives with clear care instructions. We share step-by-step guides (on our blog and YouTube channel) and quick tips (on Instagram and Facebook) so you always know how to nurture your greens.</li>
            <li><strong>Personalized Support:</strong> When you join Vriksh Valley, you become part of our family. We remember your name—and your plant's name—offering one-on-one help through chat or call whenever you need us.</li>
            <li><strong>Sustainable Growth:</strong> We use eco-friendly packaging and organic methods, so each plant (and the earth it came from) gets only healthy, natural care.</li>
          </ul>
          <p>
            Through these commitments, we nurture not just plants, but the confidence of our gardeners. Many brands have built great green gardens online: Ugaoo and NurseryLive make shopping easy; Ferns N Petals and TrustBasket make gifting simple (TrustBasket even calls itself a "one-stop online gardening store"); MyBageecha helps city-dwellers stay close to nature. We admire those visions, but at Vriksh Valley we add a heart and a listening ear to every leafy friend's journey. We become Nature's Companion to you and your plant, guiding you at every step.
          </p>
        </section>

        <section className="content-section">
          <h2>Your Nature's Companion</h2>
          <p>
            When you open a box from Vriksh Valley, imagine a friend by your side. Each plant is paired with personalized care tips—like where the morning sun will make it happiest, or the perfect watering routine to keep its leaves glossy. We truly believe that when you bring home a plant from Vriksh Valley, it thrives not just because it's healthy at arrival, but because you know how to care for it, and you have us to turn to when questions arise. That's the promise of Nature's Companion: your plant is never alone, and neither are you.
          </p>
          <p>
            Even in our online community, we share the same calm, grounded vibe of nature. Our Instagram posts are little green breaths of inspiration; our YouTube videos are gentle tutorials that feel like walks in the garden. On Facebook, LinkedIn and Threads we share stories of growth, sustainability and simple gardening hacks—all in a warm, sincere tone. We want every interaction to feel like a peaceful moment under a tree, where you learn, smile and feel connected to the earth.
          </p>
        </section>

        <section className="content-section">
          <h2>Growing Together: Join Our Tribe</h2>
          <p>
            Vriksh Valley is more than an online nursery—it's a movement to bring the green back. Every plant we grow is a small victory against concrete, and every customer becomes a caretaker of something living, something growing. Our story is your story too: rediscovering wonder in a leaf, finding home in soil, remembering we were never meant to live in concrete alone.
          </p>
          <p>
            Be part of our growing community. When you choose Vriksh Valley, you join a family of nature lovers and guardians who encourage each other to make small green changes every day. Together, let's grow lush indoor forests, thriving balconies and peaceful gardens. Welcome to Vriksh Valley. Let's grow together.
          </p>
        </section>

        <div className="cta-section">
          <Link href="/products" className="primary-button">
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
