import React from 'react'

export default function ImageGrid() {
  const paths = [""]
  const imgs = paths.map((path:string) => <img src={path} />)
  return (
      <div>
        {imgs}
        <h2></h2>
      </div>
  )
}
