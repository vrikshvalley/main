'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import "@/styles/categoryCircles.scss";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const circleVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 30
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1] // Back easing similar to back.out
    }
  }
};

export default function CategoryCircles() {
  return (
    <motion.section 
      className="category-circles"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2, margin: "0px 0px -100px 0px" }}
      variants={containerVariants}
    >
      <motion.div className="circle-container" variants={containerVariants}>

        <Link href="/category/indoor-plants" passHref>
          <motion.div className="circle-item" variants={circleVariants}>
            <div className="circle-image">
              <Image
                src="/indoor.jpg"
                alt="Indoor Plants"
                width={100}
                height={100}
                loading="lazy"
                style={{ borderRadius: '50%' }}
              />
            </div>
            <p>Indoor Plants</p>
          </motion.div>
        </Link>

        <Link href="/category/outdoor-plants" passHref>
          <motion.div className="circle-item" variants={circleVariants}>
            <div className="circle-image">
              <Image
                src="/outdoor.jpg"
                alt="Outdoor Plants"
                width={100}
                height={100}
                loading="lazy"
                style={{ borderRadius: '50%' }}
              />
            </div>
            <p>Outdoor Plants</p>
          </motion.div>
        </Link>

        <Link href="/category/succulents" passHref>
          <motion.div className="circle-item" variants={circleVariants}>
            <div className="circle-image">
              <Image
                src="/succulents.jpg"
                alt="Succulents"
                width={100}
                height={100}
                loading="lazy"
                style={{ borderRadius: '50%' }}
              />
            </div>
            <p>Succulents</p>
          </motion.div>
        </Link>

        <Link href="/category/flowering" passHref>
          <motion.div className="circle-item" variants={circleVariants}>
            <div className="circle-image">
              <Image
                src="/flowering.jpg"
                alt="Flowering"
                width={100}
                height={100}
                loading="lazy"
                style={{ borderRadius: '50%' }}
              />
            </div>
            <p>Flowering</p>
          </motion.div>
        </Link>

        <Link href="/category/herbs" passHref>
          <motion.div className="circle-item" variants={circleVariants}>
            <div className="circle-image">
              <Image
                src="/herbs.jpg"
                alt="Herbs"
                width={100}
                height={100}
                loading="lazy"
                style={{ borderRadius: '50%' }}
              />
            </div>
            <p>Herbs</p>
          </motion.div>
        </Link>

      </motion.div>
    </motion.section>
  );
}
