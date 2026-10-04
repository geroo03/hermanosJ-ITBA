import '../styles/layout.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <section className="footer__brand" aria-label="Hermanos Jota">
          <p className="footer__brand-name">Hermanos Jota</p>
          <p>
            El redescubrimiento de un arte olvidado: crear muebles que no solo sirven una
            función, sino que alimentan el alma.
          </p>
        </section>

        <section aria-labelledby="footer-workshop">
          <h2 id="footer-workshop" className="footer__title">Casa Taller</h2>
          <address className="footer__list">
            <span>Av. San Juan 2847 (C1232AAB)</span>
            <span>San Cristóbal, CABA, Argentina</span>
          </address>
        </section>

        <section aria-labelledby="footer-hours">
          <h2 id="footer-hours" className="footer__title">Horarios</h2>
          <p className="footer__list">
            <span>Lunes a viernes: 10:00 a 19:00 hs</span>
            <span>Sábados: 10:00 a 14:00 hs</span>
          </p>
        </section>

        <section aria-labelledby="footer-channels">
          <h2 id="footer-channels" className="footer__title">Canales</h2>
          <ul className="footer__list">
            <li>
              <a href="mailto:info@hermanosjota.com.ar">info@hermanosjota.com.ar</a>
            </li>
            <li>
              <a href="https://wa.me/541145678900" target="_blank" rel="noopener noreferrer">
                WhatsApp +54 11 4567-8900
              </a>
            </li>
            <li>
              <a href="https://instagram.com/hermanosjota_ba" target="_blank" rel="noopener noreferrer">
                Instagram @hermanosjota_ba
              </a>
            </li>
          </ul>
        </section>
      </div>

      <p className="footer__legal">© {year} Hermanos Jota. Todos los derechos reservados.</p>
    </footer>
  );
}

export default Footer;
