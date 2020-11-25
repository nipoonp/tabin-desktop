import React from "react";
const styles = require("./serverError.module.css");

export const ServerError = (props: { message: string }) => {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex" }}>
        <div className={styles.iconContainer}>
          <svg
            viewBox="0 0 24 24"
            role="presentation"
            aria-hidden="true"
            focusable="false"
            style={{
              height: "24px",
              width: "24px",
              display: "block",
              fill: "rgb(255, 255, 255)"
            }}
          >
            <path d="m23.49 20.79c.39.73.12 1.64-.61 2.03-.22.12-.46.18-.71.18h-20.33c-.83 0-1.5-.67-1.5-1.5 0-.25.06-.49.18-.71l10.16-18.94c.39-.73 1.3-1 2.03-.61.26.14.47.35.61.61zm-11.05-18.47c-.05-.09-.12-.16-.2-.2-.24-.13-.55-.04-.68.2l-10.16 18.94c-.04.07-.06.15-.06.24 0 .28.22.5.5.5h20.33c.08 0 .16-.02.24-.06.24-.13.33-.43.2-.68zm-.48 4.68c-.58.02-1.04.51-1.02 1.1l.29 7.42c.01.27.23.48.5.48h.54c.27 0 .49-.21.5-.48l.29-7.42c0-.01 0-.03 0-.04 0-.58-.47-1.06-1.06-1.06-.01 0-.03 0-.04 0zm-.96 12c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z" />
          </svg>
        </div>
        <div className={styles.textContainer}>
          <div className={styles.text}>{props.message}</div>
        </div>
      </div>
    </div>
  );
};
