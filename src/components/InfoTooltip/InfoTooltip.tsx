"use client";

import React from "react";
import styles from "./InfoTooltip.module.css";

interface InfoTooltipProps {
  title?: string;
  description?: string;
}

/**
 * Shows a small circular 'i' icon. When hovered,
 * a tooltip box appears to the right with the provided
 * title and description.
 */
const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title = "Info",
  description = "",
}) => {
  return (
    <div className={styles.tooltipContainer}>
      <div className={styles.infoIcon}>i</div>
      <div className={styles.tooltipBox}>
        {title && <h4>{title}</h4>}
        {description && <p>{description}</p>}
      </div>
    </div>
  );
};

export default InfoTooltip;
