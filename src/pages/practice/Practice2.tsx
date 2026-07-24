import { useState } from "react"

interface Person {
  name:string,
  age:number,
  isMarried:boolean
}

const Practice2 = (props: Person) => {
    const [info, setInfo]=useState<string | null>("");
    const handleChange= (event: React.ChangeEvent<HTMLInputElement>)=>{
        setInfo(event.target.value)
    }
  return (
    <div>
        <input onChange={handleChange}  />
    </div>
  )
}

export default Practice2