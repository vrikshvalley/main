'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail, Linkedin, Twitter } from 'lucide-react';
import '@/styles/meetOurTeam.scss';

const teamMembers = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Founder & Plant Expert",
    image: "/hero1.jpg", // Replace with actual team member image
    bio: "With over 15 years of experience in horticulture, Priya founded Vriksh Valley to bring sustainable greenery to urban homes.",
    email: "priya@vrikshvalley.com",
    linkedin: "#",
    twitter: "#"
  },
  {
    id: 2,
    name: "Arjun Patel",
    role: "Head of Operations",
    image: "/hero2.jpg", // Replace with actual team member image
    bio: "Arjun ensures every plant reaches you in perfect condition, managing our nursery and logistics with passion.",
    email: "arjun@vrikshvalley.com",
    linkedin: "#",
    twitter: "#"
  },
  {
    id: 3,
    name: "Sneha Reddy",
    role: "Plant Care Specialist",
    image: "/hero3.jpg", // Replace with actual team member image
    bio: "Sneha is our go-to expert for plant care advice, helping customers nurture their green companions.",
    email: "sneha@vrikshvalley.com",
    linkedin: "#",
    twitter: "#"
  },
  {
    id: 4,
    name: "Rahul Kumar",
    role: "Community Manager",
    image: "/hero1.jpg", // Replace with actual team member image
    bio: "Rahul builds and nurtures our plant-loving community, organizing workshops and green events.",
    email: "rahul@vrikshvalley.com",
    linkedin: "#",
    twitter: "#"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
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
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.div className="team-header" variants={cardVariants}>
          <h2 className="team-title">Meet Our Green Squad</h2>
          <p className="team-subtitle">
            The passionate individuals behind Vriksh Valley, dedicated to bringing nature to your doorstep
          </p>
        </motion.div>

        <motion.div className="team-grid" variants={containerVariants}>
          {teamMembers.map((member) => (
            <motion.div 
              key={member.id} 
              className="team-card"
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
                    <a href={member.twitter} className="social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                      <Twitter size={20} />
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
