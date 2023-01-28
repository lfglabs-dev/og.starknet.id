import React, { FunctionComponent } from "react";
import styles from "../../styles/button.module.css";

type ButtonProps = {
  onClick: () => void;
  children: string | React.ReactNode;
  disabled?: boolean;
};

const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={styles["nq-button"]}
    >
      {children}
    </button>
  );
};

export default Button;
