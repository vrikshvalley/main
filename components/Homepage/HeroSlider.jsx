'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import '@/styles/heroSlider.scss';
import ImpactCounter from '@/components/Homepage/ImpactCounter';

const contentVariants = {
  hidden: { 
    opacity: 0
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// photosynthesisVariants removed — static colors used for hero title

export default function HeroSlider() {
  const router = useRouter();

  const handleJoinMovement = () => {
    router.push('/join-green-movement');
  };

  const handleNatureNurture = () => {
    router.push('/where-nature-meets-nurture');
  };

  return (
    <div className="heroContainer">
      <div className="sliderWrapper">
        <video
          className="heroVideo"
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Vriksh Valley hero video"
        />
      </div>
      
      <motion.div 
        className="heroContent"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={contentVariants}
      >
        <div className="heroInner">
          <div className="heroLeft">
            <motion.button 
              className="badge badge-clickable" 
              variants={itemVariants}
              onClick={handleNatureNurture}
              aria-label="Learn about where nature meets nurture"
            >
              🌿 Where Nature Meets Nurture
            </motion.button>
            
            <motion.h1 
              className="heroTitle" 
              variants={itemVariants}
            >
             <motion.span
                style={{
                  color: '#ffffff',
                  display: 'inline-block'
                }}
             >
              Welcome to 
             </motion.span>
             <br/>
             <motion.span 
               style={{ 
                  color: '#35e498',
                  display: 'inline-block'
                }}
              
             >
                Vriksh 
              </motion.span><span>Valley</span>
            </motion.h1>
            
            <motion.p className="heroSubtitle" variants={itemVariants}>
              Every home deserves a touch of green. <br/>Transform your space into a sanctuary where plants thrive and life slows down to the gentle rhythm of growth
            </motion.p>

            <motion.div className="features" variants={itemVariants}>
              <div className="feature">Healthy Plants</div>
              <div className="feature">Eco Packaging</div>
              <div className="feature">Expert Support</div>
            </motion.div>

            <motion.div className="ctaButtons" variants={itemVariants}>
              <button className="ctaButton" onClick={handleJoinMovement}>
                Join Us
              </button>
              <button className="ctaButtonSecondary" onClick={() => router.push('/products')}>
                Shop Now
              </button>
            </motion.div>
          </div>

          <div className="heroRight" id="impact">
            <div className="heroImpact">
              <ImpactCounter variant="hero" showHeader={true} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}