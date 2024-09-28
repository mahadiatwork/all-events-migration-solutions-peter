import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ActivityTable from './components/ActivityTable'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ActivityTable />
    </>
  )
}

export default App
