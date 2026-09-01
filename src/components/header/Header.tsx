import React, { useContext } from 'react'
import styles from './header.module.scss'
import { Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
type Props = {}

const Header = (props: Props) => {
  const { theme, toggleTheme } = useTheme(); 

  const handleThemeToggle = () => {
    toggleTheme();
  }

  return (
    <div className="flex items-center justify-around gap-3 p-3 border-b border-border sticlky top-0 z-10" style={{ backgroundColor: "var(--background)" }}>
      <div className={styles.searchInpCont}>
        <input type="text" placeholder='Search' className={styles.searchInp} />
      </div>
      <div className="flex items-center gap-2">
        <Moon size={20} fill="beige" className="cursor-pointer" onClick={handleThemeToggle} />
      </div>
    </div>
  )
}

export default Header;
