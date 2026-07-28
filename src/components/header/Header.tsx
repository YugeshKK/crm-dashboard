import React from 'react'
import styles from './header.module.scss'
type Props = {}

const Header = (props: Props) => {
  return (
    <div className={styles.headerCont}>
      <input className="flex items-center" placeholder="Search..." />
    </div>
  )
}

export default Header;