'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail, Linkedin } from 'lucide-react';
import '@/styles/meetOurTeam.scss';

const teamMembers = [
  {
    id: 1,
    name: "Sagnik Dutta",
    role: "Founder & Green Enthusiast",
    image: "/sagnik.png",
    bio: "From the concrete heart of the city to thriving green sanctuaries, Sagnik turned his frustration with clueless nurseries and wilting plants into a mission‑driven start-up: Vriksh Valley. He's built a platform where every plant arrives with expert knowledge, personalized care, and a trusted \"plant whisperer\" who knows exactly why your leafy friends are throwing a tantrum. \n\nUnder his leadership, Vriksh Valley is turning the chaos of plant parenting into a seamless, confidence‑boosting experience—one thriving green at a time.🌱",
    email: "sagnikdutta2001@gmail.com",
    linkedin: "https://www.linkedin.com/in/sagnik-dutta-524720250/",
    size: "large"
  },
  {
    id: 2,
    name: "Debayan Mukherjee",
    role: "Developer and Digital Gardener",
    image: "/debayan.png",
    bio: "Debayan isn't just a coder—he's the gardener of Vriksh Valley's digital landscape, shaping online experiences that feel like a quiet walk through a thriving garden: clean, inviting, and subtly rooted in nature. Every seamless scroll through our catalogue, every effortless checkout, every feature that makes plant‑parenting easier—he engineers the vision into reality, planting the effortless love you feel for your online garden.🌱",
    email: "astrodebayan.18@gmail.com",
    linkedin: "https://www.linkedin.com/in/dev-web3000",
    size: "small"
  },
  {
    id: 3,
    name: "Susmita Sen",
    role: "Sustainability Manager",
    image: "/susmita.png",
    bio: "Susmita doesn't just talk about sustainable gardening—she orchestrates it. Every eco-friendly choice at Vriksh Valley (from sourcing to packaging to practices) flows through her vision. She's built a framework where profitability and planet-protection aren't opponents; they're dance partners. Because real sustainability isn't a box to check—it's how we do business.🌱",
    email: "susmitasen.1502@gmail.com",
    linkedin: "https://www.linkedin.com/in/susmita-sen-ss1502/",
    size: "small"
  },
  {
    id: 4,
    name: "Ridhima Sen",
    role: "Community Manager",
    image: "/ridhima.png",
    bio: "Ridhima cultivates our plant community — she plans hands-on workshops, runs vibrant green events, and crafts the scroll-stopping social feed that turns curious browsers into confident plant parents. A storyteller at heart, she connects newbies and experts, sparks conversations, and turns every question into a moment of growth. In short: if Vriksh Valley found you, Ridhima made it happen.🌱",
    email: "ridhimasen1607@gmail.com",
    linkedin: "http://www.linkedin.com/in/ridhimasen1607",
    size: "small"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 80,
    scale: 0.85,
    rotateX: 15
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function MeetOurTeam() {
  return (
    <section className="meet-our-team">
      <motion.div 
        className="team-container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        variants={containerVariants}
      >
        <motion.div className="team-header" variants={cardVariants}>
          <h2 className="team-title">Meet Our Green Squad</h2>
          <p className="team-subtitle">
            The passionate individuals behind Vriksh Valley, <br />
            dedicated to bringing nature to your doorstep
          </p>
        </motion.div>

        <motion.div className="team-grid" variants={containerVariants}>
          {teamMembers.map((member) => (
            <motion.div 
              key={member.id} 
              className={`team-card ${member.size || ''}`}
              variants={cardVariants}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <div className="team-image-wrapper">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={300}
                  height={300}
                  className="team-image"
                />
                <div className="team-overlay">
                  <div className="social-links">
                    <a href={`mailto:${member.email}`} className="social-link" aria-label="Email">
                      <Mail size={20} />
                    </a>
                    <a href={member.linkedin} className="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                      <Linkedin size={20} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="team-info">
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
