import React from 'react'
import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'
import '@/components/sub/menu/styles.scss'
import '@/components/sub/menu/menu-item.scss'



export default ({
  icon, title, action, isActive = null,
}) => (
  <button
    className={`menu-item${isActive && isActive() ? ' is-active' : ''}`}
    onClick={action}
    title={title}
  >
    <svg className="remix">
      <use xlinkHref={`${remixiconUrl}#ri-${icon}`} />
    </svg>
  </button>
)

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
