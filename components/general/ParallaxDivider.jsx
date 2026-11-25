/**
 * Layered hills between sections. The parallax is a CSS scroll-driven
 * animation (styles/parallaxDivider.scss): no JavaScript, no scroll listeners.
 * Server component.
 */
import '@/styles/parallaxDivider.scss';

export default function ParallaxDivider() {
  return (
    <div className="vv-divider" aria-hidden="true">
      <svg className="vv-divider__back" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L0,320Z" />
      </svg>
      <svg className="vv-divider__mid" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0,192L60,197.3C120,203,240,213,360,202.7C480,192,600,160,720,165.3C840,171,960,213,1080,224C1200,235,1320,213,1380,202.7L1440,192L1440,320L0,320Z" />
      </svg>
      <svg className="vv-divider__front" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,133.3C672,139,768,213,864,229.3C960,245,1056,203,1152,186.7C1248,171,1344,181,1392,186.7L1440,192L1440,320L0,320Z" />
      </svg>
    </div>
  );
}
