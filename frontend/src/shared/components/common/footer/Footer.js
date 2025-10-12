import { Link } from "react-router-dom";
import classes from "./Footer.module.css";

function Footer() {
  return (
    <footer className={classes.footer}>
      <div className={classes.footerContent}>
        <p className={classes.copyright}>
          &copy; 2025 TourismPulseNZ | All rights reserved
        </p>
        <p className={classes.contact}>
          Email:{" "}
          <a
            className={classes.anchor}
            href="mailto:hah15@students.waikato.ac.nz"
          >
            info@tourismpulsenz.com
          </a>{" "}
          | Hours: 9:00 AM - 5:00 PM NZST
        </p>
        <div className={classes.links}>
          <Link to="/terms" className={classes.footerLink}>
            Terms
          </Link>
          <Link to="/privacy" className={classes.footerLink}>
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
