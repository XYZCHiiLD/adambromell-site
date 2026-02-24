'use client';
import ParallaxImage from '@/components/ParallaxImage';
import SectionHeader from '@/components/SectionHeader';
import ExternalLink from '@/components/ExternalLink';
import ProfileSection from '@/components/ProfileSection';
import { colors, typography } from '@/styles/theme';

const HEADER_IMAGES = [
  '/photo-1.jpg',
  '/photo-2.jpg',
  '/photo-3.jpg',
  '/photo-4.jpg',
  '/photo-5.jpg',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div 
        className="max-w-3xl mx-auto px-12 py-16 md:py-24 min-h-screen bg-cloud-dancer"
        style={{ position: 'relative' }}
      >
        <ParallaxImage images={HEADER_IMAGES} />
        
        {/* Header */}
        <header className="mb-4">
          <h1 
            className="font-bold mb-0"
            style={{ fontSize: typography.sizes.h1, lineHeight: typography.lineHeights.tight }}
          >
            ADAM BROMELL
          </h1>
        </header>

        {/* About */}
        <section className="mb-12">
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>BUILDING SANDBOXES THAT FOSTER FRIENDSHIPS.</p>
            <p>MAKING SPACES FOR STANDING SHOULDER-TO-SHOULDER, NOT FACE-TO-FACE.</p>
            <p>CREATING KNOWING THAT VALUE IS PERCEIVED, NEVER INHERENT.</p>
            <p>
              CO-FOUNDER & CREATIVE DIRECTOR OF{' '}
              <ExternalLink href="https://www.systemera.net/" bold>
                SYSTEM ERA
              </ExternalLink>.
            </p>
            <p><strong>ASTRONEER</strong>'S DAD.</p>
            <p>FIGHTING BURNOUT BY CHASING LIGHT THROUGH A LENS.</p>
          </div>

          {/* Social links */}
          <div className="flex gap-6 mt-8">
            <p>
              bluesky: <ExternalLink href="https://bsky.app/profile/adambromell.info">
                adambromell.info
              </ExternalLink>
            </p>
            <p>
              threads: <ExternalLink href="https://www.threads.net/@adambromell">
                @adambromell
              </ExternalLink>
            </p>
            <p>
              instagram (photography): <ExternalLink href="https://www.instagram.com/yeti.snaps/">
                @yeti.snaps
              </ExternalLink>
            </p>
          </div>
        </section>

        <hr className="mb-12" style={{ borderColor: colors.black, borderWidth: '0.5px' }} />

        {/* System Era */}
        <section className="mb-12">
          <SectionHeader>system era</SectionHeader>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <ProfileSection title="COMPANY">
              <p>co-founded in 2014</p>
              <p>
                <ExternalLink href="https://www.gamedeveloper.com/business/devolver-digital-to-acquire-astroneer-dev-system-era-for-up-to-40m">
                  acquired by DEVOLVER DIGITAL in 2023
                </ExternalLink>
              </p>
            </ProfileSection>
            
            <ProfileSection title="ASTRONEER" spacing="large">
              <p>base building survival sandbox</p>
              <p>
                <ExternalLink href="https://www.gamedeveloper.com/design/what-i-astroneer-i-s-devs-learned-while-leaving-early-access">
                  pioneering voxel technology
                </ExternalLink>
              </p>
              <p>14M+ players across all platforms</p>
              <p>#1 game on STEAM weeks after early access launch</p>
            </ProfileSection>

            <ProfileSection title="STARSEEKER: ASTRONEER EXPEDITIONS" spacing="large">
              <p>massively co-operative expeditions</p>
              <p>40+ player space station hub</p>
              <p>
                <ExternalLink href="https://gamerant.com/starseeker-astroneer-expeditions-live-service-fomo-content/">
                  ethical, sustainable "live service"
                </ExternalLink>
              </p>
              <p>releasing 2026</p>
            </ProfileSection>
          </div>
        </section>

        <hr className="mb-12" style={{ borderColor: colors.black, borderWidth: '0.5px' }} />

        {/* History */}
        <section className="mb-12">
          <SectionHeader>history</SectionHeader>
          <div className="space-y-6 text-gray-800 leading-relaxed">
            
            <ProfileSection title="SYSTEM ERA">
              <p>2014-PRESENT</p>
              <p>co-founder, chief creative officer, and creative director</p>
            </ProfileSection>

            <ProfileSection title="UBISOFT">
              <p>2011-2016</p>
              <p>assistant art director</p>
            </ProfileSection>

            <ProfileSection title="POLYCOUNT">
              <p>2006-2016</p>
              <p>community & engagement lead</p>
            </ProfileSection>

            <ProfileSection title="RELIC ENTERTAINMENT">
              <p>2009-2011</p>
              <p>artist</p>
            </ProfileSection>

            <ProfileSection title="THREEWAVE SOFTWARE">
              <p>2005-2009</p>
              <p>artist</p>
            </ProfileSection>

            <ProfileSection title="Freelance">
              <p>2001-2005</p>
              <p>artist</p>
            </ProfileSection>

          </div>
        </section>

      </div>
    </main>
  )
}
