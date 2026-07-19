import React from 'react'
import { useLocation } from 'react-router-dom'

type Props = {}

const Products = (props: Props) => {
  const location= useLocation();

  function handleClick(){
    console.log(location.pathname)
  }
  return (
    <div>
      <p>Products</p>
      <button onClick={handleClick}>get Path name</button>
    </div>
  )
}

export default Products