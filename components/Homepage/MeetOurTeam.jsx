import Image from 'next/image';
import { Mail, Linkedin } from 'lucide-react';
import AnimatedText from '@/components/general/AnimatedText';
import '@/styles/meetOurTeam.scss';

const teamMembers = [
  {
    id: 1,
    name: "Sagnik Dutta",
    role: "Founder & Green Enthusiast",
    image: "/team/sagnik.webp",
    bio: "From the concrete heart of the city to thriving green sanctuaries, Sagnik turned his frustration with clueless nurseries and wilting plants into a mission‑driven start-up: Vriksh Valley. He's built a platform where every plant arrives with expert knowledge, personalized care, and a trusted \"plant whisperer\" who knows exactly why your leafy friends are throwing a tantrum. \n\nUnder his leadership, Vriksh Valley is turning the chaos of plant parenting into a seamless, confidence‑boosting experience—one thriving green at a time.🌱",
    email: "sagnikdutta2001@gmail.com",
    linkedin: "https://www.linkedin.com/in/sagnik-dutta-524720250/",
    size: "large"
  },
  {
    id: 2,
    name: "Debayan Mukherjee",
    role: "Lead Technical Developer",
    image: "/team/debayan.webp",
    bio: "Debayan isn't just a coder—he's the gardener of Vriksh Valley's digital landscape, shaping online experiences that feel like a quiet walk through a thriving garden: clean, inviting, and subtly rooted in nature. Every seamless scroll through our catalogue, every effortless checkout, every feature that makes plant‑parenting easier—he engineers the vision into reality, planting the effortless love you feel for your online garden.🌱",
    email: "astrodebayan.18@gmail.com",
    linkedin: "https://www.linkedin.com/in/dev-web3000",
    size: "small"
  },
  {
    id: 3,
    name: "Susmita Sen",
    role: "Sustainability Manager",
    image: "/team/susmita.webp",
    bio: "Susmita doesn't just talk about sustainable gardening—she orchestrates it. Every eco-friendly choice at Vriksh Valley (from sourcing to packaging to practices) flows through her vision. She's built a framework where profitability and planet-protection aren't opponents; they're dance partners. Because real sustainability isn't a box to check—it's how we do business.🌱",
    email: "susmitasen.1502@gmail.com",
    linkedin: "https://www.linkedin.com/in/susmita-sen-ss1502/",
    size: "small"
  },
  {
    id: 4,
    name: "Ridhima Sen",
    role: "Community Manager",
    image: "/team/ridhima.webp",
    bio: "Ridhima cultivates our plant community — she plans hands-on workshops, runs vibrant green events, and crafts the scroll-stopping social feed that turns curious browsers into confident plant parents. A storyteller at heart, she connects newbies and experts, sparks conversations, and turns every question into a moment of growth. In short: if Vriksh Valley found you, Ridhima made it happen.🌱",
    email: "ridhimasen1607@gmail.com",
    linkedin: "http://www.linkedin.com/in/ridhimasen1607",
    size: "small"
  }
];

/**
 * Team section. Server component with one markup for all screens: a grid on
 * desktop and a native scroll-snap row on phones (no client-side swap).
 * Cards use the CSS scroll-linked fade (.scroll-fade).
 */
export default function MeetOurTeam() {
  return (
    <section className="meet-our-team">
      <div className="team-container">
        <div className="team-header scroll-fade">
          <p className="cursive-subtitle">Our Green Family</p>
          <AnimatedText as="h2" text="Meet Our Green Squad" className="team-title" delay={0.1} stagger={0.05} />
          <AnimatedText
            as="p"
            text="The passionate individuals behind Vriksh Valley, dedicated to bringing nature to your doorstep"
            className="team-subtitle"
            delay={0.2}
          />
        </div>

        <ul className="team-grid team-track">
          {teamMembers.map((member) => (
            <li key={member.id} className={`team-card scroll-fade ${member.size || ''}`}>
              <div className="team-image-wrapper">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 80vw, 300px"
                  className="team-image"
                  quality={75}
                />
                <div className="team-overlay">
                  <div className="social-links">
                    <a href={`mailto:${member.email}`} className="social-link" aria-label={`Email ${member.name}`}>
                      <Mail size={20} />
                    </a>
                    <a
                      href={member.linkedin}
                      className="social-link"
                      aria-label={`${member.name} on LinkedIn`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
