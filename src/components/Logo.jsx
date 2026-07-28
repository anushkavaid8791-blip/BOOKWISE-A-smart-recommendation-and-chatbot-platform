import "./Logo.css";

/**
 * Logo — open-book icon + "BookWise" wordmark.
 * `variant` controls color: "light" (for dark backgrounds) or "dark".
 */
function Logo({ variant = "light" }) {
  return (
    <div className={`logo logo--${variant}`}>
      <svg
        width="26"
        height="22"
        viewBox="0 0 26 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M13 4.5C10.8 2.6 7.6 1.8 2 2v15.5c5.6-.3 8.8.5 11 2.4V4.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M13 4.5C15.2 2.6 18.4 1.8 24 2v15.5c-5.6-.3-8.8.5-11 2.4V4.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <span className="logo__text">BookWise</span>
    </div>
  );
}

export default Logo;
