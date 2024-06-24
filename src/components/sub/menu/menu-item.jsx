import React from "react";
import "@/components/sub/menu/styles.scss";
import "@/components/sub/menu/menu-item.scss";

const MenuItem = ({ children, title, action, isActive = null }) => (
  <button
    className={`menu-item${isActive && isActive() ? " is-active" : ""}`}
    onClick={action}
    title={title}
  >
    {children}

  </button>
);

export default MenuItem;
