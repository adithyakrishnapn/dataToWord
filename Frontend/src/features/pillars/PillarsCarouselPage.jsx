import { useState } from 'react';
import PillarOnePage from '../pillar1/PillarOnePage';
import GenericPillarPage from './GenericPillarPage';
import { pillarTabs } from './pillarConfig';

export default function PillarsCarouselPage() {
  const [activePillar, setActivePillar] = useState(1);

  return (
    <>
      <div className="page-wrap" style={{ paddingBottom: 0 }}>
        <section className="section-card" style={{ marginTop: '1.5rem' }}>
          <div className="section-card-head">
            <h2>Annual Report Pillars</h2>
            <p>Switch pillars using this carousel. Edit tab always shows the selected pillar data only.</p>
          </div>
          <div className="pillars-carousel">
            {pillarTabs.map((pillar) => (
              <button
                key={pillar.id}
                type="button"
                className={`pillars-chip ${pillar.id === activePillar ? 'pillars-chip-active' : ''}`}
                onClick={() => setActivePillar(pillar.id)}
              >
                <span>{pillar.title}</span>
                <small>{pillar.subtitle}</small>
              </button>
            ))}
          </div>
        </section>
      </div>

      {activePillar === 1 ? <PillarOnePage /> : <GenericPillarPage pillarId={activePillar} />}
    </>
  );
}
