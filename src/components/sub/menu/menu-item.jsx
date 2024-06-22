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
    {/* <svg className="remix">
      <use xlinkHref={`${remixiconUrl}#ri-${icon}`} />
    </svg> */}
  </button>
);

// import React from 'react'
// import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'

// export default ({
//   icon, title, action, isActive = null,
// }) => (
//   <button
//     className={`menu-item${isActive && isActive() ? ' is-active' : ''}`}
//     onClick={action}
//     title={title}
//   >
//     <svg className="remix">
//       <use xlinkHref={`${remixiconUrl}#${icon}`} />
//     </svg>
//   </button>
// )

export default MenuItem;
