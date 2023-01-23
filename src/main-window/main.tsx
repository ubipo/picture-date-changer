import React from 'react'
import ReactDOM from 'react-dom'
import ImageGrid from './imageGrid.js'
import './imageGrid.css'

console.log('>>>> Preload script loaded')
window.addEventListener('DOMContentLoaded', () => {
    console.info('DOM loaded')
    ReactDOM.render(<ImageGrid />, document.getElementById('app'))
})
