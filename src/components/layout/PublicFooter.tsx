import { Link } from 'react-router-dom'

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-board">
        <div className="ftile ftile-statement">
          <p>Tax, corporate, and compliance for individuals and businesses in Pakistan.</p>
          <p className="legal">
            © {new Date().getFullYear()} TaxLegalPro · Informational public site; engagement letters
            govern paid work.
          </p>
        </div>
        <div className="ftile ftile-nav">
          <ul>
            <li>
              <Link to="/services">Services</Link>
            </li>
            <li>
              <Link to="/pricing">Pricing</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy</Link>
            </li>
            <li>
              <Link to="/terms">Terms</Link>
            </li>
          </ul>
        </div>
        <div className="ftile ftile-city">
          <p>Lahore</p>
          <p style={{ marginTop: '0.5rem', color: 'var(--ink)' }}>
            Karachi · Islamabad
          </p>
          <LocalClock />
        </div>
        <div className="ftile ftile-email">
          <a href="mailto:hello@taxlegalpro.pk">hello@taxlegalpro.pk</a>
        </div>
        <div className="ftile ftile-mark">
          <span className="word">TaxLegalPro</span>
        </div>
        <Link to="/consultation" className="ftile ftile-invite">
          <span>Talk to the desk</span>
          <svg viewBox="0 0 36 36" aria-hidden fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M8 18h18M18 8l10 10-10 10" />
          </svg>
        </Link>
      </div>
      <div className="footer-credits">
        Pictures: Badshahi Mosque by Zaki imtiaz (CC BY-SA 4.0); Faisal Mosque by Ali Mujtaba (CC
        BY-SA 4.0); Lahore street 1914 by Stéphane Passet (public domain); Karachi Harbour chart by
        UKHO (public domain); street film by Sounds of Changes (CC BY 3.0). Credits do not imply
        affiliation.
      </div>
    </footer>
  )
}

function LocalClock() {
  const now = new Date()
  const time = new Intl.DateTimeFormat('en-PK', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now)
  return (
    <p style={{ marginTop: 'auto', fontSize: 16 }}>
      PKT {time}
    </p>
  )
}
