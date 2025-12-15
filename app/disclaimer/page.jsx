'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Breadcrumbs from '@/components/general/Breadcrumbs';
import { setStickyHeaderData } from '@/lib/stickyHeaderStore';
import '@/styles/pages.scss';

export default function Disclaimer() {
  useEffect(() => {
    setStickyHeaderData({ title: "Disclaimer", subtitle: "Important information about our services and products" });
    return () => setStickyHeaderData({ title: null, subtitle: null });
  }, []);

  return (
    <div className="page-container">
      
      {/* Hero Banner */}
      <div className="hero-banner">
        <picture>
          <source media="(max-width: 768px)" srcSet="/DisclaimerMobile.png" />
          <Image
            src="/DisclaimerDesktop.png"
            alt="Disclaimer - Vriksh Valley"
            fill
            priority
            className="hero-image"
            style={{ objectFit: 'cover' }}
          />
        </picture>
        <div className="hero-overlay">
          <h1>Disclaimer</h1>
          <p>Important information about our services and products</p>
        </div>
      </div>

      <Breadcrumbs items={[{ label: 'Disclaimer' }]} />
      
      <div className="page-content">
        <div className="page-header">
          <h1>Disclaimer – Vriksh Valley</h1>
          <p>Important information about our services and products</p>
        </div>

        <div className="content-section">
          <p>
            Greetings from Vriksh Valley! The information provided on our website is for general informational and educational purposes only. Accessing or using our website indicates that you agree to the terms outlined in this Disclaimer, along with our Terms & Conditions and Privacy Policy.
          </p>

          <p>
            While we strive to maintain accuracy and reliability in every piece of information presented, Vriksh Valley makes no guarantees, representations or warranties of any kind, express or implied, about the completeness, accuracy or suitability of the content provided.
          </p>

          <h2>Product Representation</h2>
          <p>
            All plants, pots, and gardening accessories displayed on our website are shown through high-quality images and detailed descriptions to help you make informed choices. However, as plants are living entities, slight variations in size, shape, color, and growth patterns are natural and unavoidable. Environmental conditions, lighting, and seasonal changes may affect how a plant appears or grows once it reaches your home.
          </p>
          <p>
            We make every effort to ensure that our plants are healthy and vibrant. But minor differences from the images shown on the website should be expected and do not qualify as defects.
          </p>

          <h2>Care Guidance and Content Accuracy</h2>
          <p>
            The care instructions, blogs, and plant tips shared on Vriksh Valley are designed to offer general guidance for plant lovers. These recommendations are based on our horticultural knowledge and experience. However, results may vary depending on your local climate, soil conditions, and individual care routines.
          </p>
          <p>
            We encourage customers to consider their environmental conditions before purchasing plants. Vriksh Valley is not responsible for plant damage caused by improper care, placement, or neglect after delivery.
          </p>

          <h2>Health, Allergy, and Safety Notice</h2>
          <p>
            Certain plants may cause allergic reactions or discomfort for sensitive individuals or pets. We recommend verifying the properties of the plants before introducing them to your space. Vriksh Valley will not be held liable for any allergic reactions, skin irritations, or toxic effects caused by specific plant species.
          </p>
          <p>
            Always wash your hands after handling soil or fertilizers, and keep plants out of reach of children and animals.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            Vriksh Valley shall not be responsible or liable for any loss, damage, injury, or expense arising directly or indirectly from the use or misuse of our products, website, or any linked third-party sites to the fullest extent permitted by law.
          </p>
          <p>
            While we make every reasonable effort to ensure timely delivery and safe packaging, we are not liable for delays or damages caused by courier partners, environmental conditions, or unforeseen circumstances beyond our control.
          </p>

          <h2>External Links and Third-Party Content</h2>
          <p>
            Our website may include links to external websites or resources maintained by third parties. These links are provided for user convenience only. Vriksh Valley does not endorse or control the content, products, or services offered on these websites and shall not be held liable for any damages or losses arising from the use of such external links.
          </p>
          <p>
            We advise users to review the privacy policies and disclaimers of all third-party websites they visit through our links.
          </p>

          <p className="thank-you-note">
            Thank you for choosing Vriksh Valley - where your green journey begins, grows, and thrives naturally.
          </p>
        </div>
      </div>
    </div>
  );
}
