import { Fragment } from 'react';
import { marqueeContent } from '@/data/landing/marqueeContent';

export default function Marquee() {
  const repeatedItems = [...marqueeContent.items, ...marqueeContent.items];

  return (
    <div className="marquee-section">
      <div className="marquee-track" id="marqueeTrack">
        {repeatedItems.map((item, idx) => (
          <Fragment key={`${item}-${idx}`}>
            <span>{item}</span>
            <span className="dot">{marqueeContent.dot}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
