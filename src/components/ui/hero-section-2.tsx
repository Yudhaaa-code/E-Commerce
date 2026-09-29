'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { motion, Variants, HTMLMotionProps } from 'framer-motion';

// Icon component for contact details
const InfoIcon = ({ type }: { type: 'website' | 'phone' | 'address' }) => {
    const icons = {
        website: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" x2="22" y1="12" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
        ),
        phone: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
        ),
        address: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        ),
    };
    return <div className="mr-2 flex-shrink-0">{icons[type]}</div>;
};

// Prop types for the HeroSection component
interface HeroSectionProps extends Omit<HTMLMotionProps<"section">, 'title'> {
  logo?: {
    url?: string;
    alt?: string;
    text?: string;
    icon?: React.ReactNode;
  };
  slogan?: string;
  title: React.ReactNode;
  subtitle: string;
  callToAction: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  backgroundImage: string;
  contactInfo: {
    website: string;
    phone: string;
    address: string;
  };
}

const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  ({ className, logo, slogan, title, subtitle, callToAction, backgroundImage, contactInfo, style, ...props }, ref) => {
    
    // Animation variants for the container to orchestrate children animations
    const containerVariants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.2,
        },
      },
    };

    // Animation variants for individual text/UI elements
    const itemVariants: Variants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut",
        },
      },
    };
    
    return (
      <motion.section
        ref={ref}
        className={cn(
          "hero-section-root relative flex w-full flex-col overflow-hidden bg-background text-foreground md:flex-row",
          className
        )}
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          minHeight: 'calc(100vh - 72px)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          borderBottom: '1px solid var(--border-subtle)',
          ...style,
        }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        {...props}
      >
        {/* Left Side: Content */}
        <div
          className="hero-section-content flex w-full flex-col justify-between p-8 md:w-1/2 md:p-12 lg:w-3/5 lg:p-16"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 'clamp(2.5rem, 5vw, 5.5rem)',
            zIndex: 2,
          }}
        >
            {/* Top Section: Logo & Main Content */}
            <div>
                <motion.header
                  className="mb-8"
                  variants={itemVariants}
                  style={{ marginBottom: '2.5rem' }}
                >
                    {logo && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {logo.icon ? (
                              <div>{logo.icon}</div>
                            ) : logo.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={logo.url} alt={logo.alt || ''} style={{ height: '32px', width: 'auto' }} />
                            ) : null}
                            <div>
                                {logo.text && (
                                  <p style={{
                                    fontSize: '1.15rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.04em',
                                    color: 'var(--text-primary)',
                                    lineHeight: 1.1,
                                  }}>
                                    {logo.text}
                                  </p>
                                )}
                                {slogan && (
                                  <p style={{
                                    fontSize: '0.68rem',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: 'var(--text-muted)',
                                    fontWeight: 600,
                                    marginTop: '2px',
                                  }}>
                                    {slogan}
                                  </p>
                                )}
                            </div>
                        </div>
                    )}
                </motion.header>

                <motion.main variants={containerVariants}>
                    <motion.h1
                      className="text-4xl font-bold leading-tight text-foreground md:text-5xl"
                      variants={itemVariants}
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(2.3rem, 4.8vw, 4rem)',
                        fontWeight: 600,
                        lineHeight: 1.14,
                        letterSpacing: '-0.02em',
                        color: 'var(--text-primary)',
                        margin: 0,
                      }}
                    >
                        {title}
                    </motion.h1>

                    <motion.div
                      className="my-6 h-1 w-20 bg-primary"
                      variants={itemVariants}
                      style={{
                        height: '3px',
                        width: '64px',
                        backgroundColor: 'var(--accent-primary)',
                        margin: '1.5rem 0',
                        borderRadius: '2px',
                      }}
                    />

                    <motion.p
                      className="mb-8 max-w-md text-base text-muted-foreground"
                      variants={itemVariants}
                      style={{
                        fontSize: '1rem',
                        lineHeight: 1.65,
                        color: 'var(--text-secondary)',
                        maxWidth: '520px',
                        marginBottom: '2rem',
                      }}
                    >
                        {subtitle}
                    </motion.p>

                    <motion.div variants={itemVariants}>
                      <a
                        href={callToAction.href || '#'}
                        onClick={(e) => {
                          if (callToAction.onClick) {
                            e.preventDefault();
                            callToAction.onClick();
                          }
                        }}
                        className="btn-nested-cta inline-flex items-center"
                        style={{
                          textDecoration: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                        }}
                      >
                        <span style={{ letterSpacing: '0.04em', fontWeight: 600 }}>
                          {callToAction.text}
                        </span>
                        <div className="icon-bubble">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </div>
                      </a>
                    </motion.div>
                </motion.main>
            </div>

            {/* Bottom Section: Footer Info Strip */}
            <motion.footer
              className="mt-12 w-full"
              variants={itemVariants}
              style={{
                marginTop: '2.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                width: '100%',
              }}
            >
                <div
                  className="hero-contact-strip"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '1.25rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <InfoIcon type="website" />
                        <span style={{ fontWeight: 500 }}>{contactInfo.website}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <InfoIcon type="phone" />
                        <span style={{ fontWeight: 500 }}>{contactInfo.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <InfoIcon type="address" />
                        <span style={{ fontWeight: 500 }}>{contactInfo.address}</span>
                    </div>
                </div>
            </motion.footer>
        </div>

        {/* Right Side: Image with Clip Path Animation */}
        <motion.div 
          className="hero-section-image w-full min-h-[300px] bg-cover bg-center md:w-1/2 md:min-h-full lg:w-2/5"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            minHeight: '340px',
            flex: '1 1 45%',
          }}
          initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
          animate={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle gradient overlay to enhance contrast */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%)',
            pointerEvents: 'none',
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '1.25rem',
            right: '1.25rem',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--glass-shadow)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Bespoke Artisan Studio 2026
            </span>
          </div>
        </motion.div>
      </motion.section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };

