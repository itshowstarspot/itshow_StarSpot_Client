import { useState } from 'react'
import Start from './pages/Start.jsx'
import Select from './pages/Select.jsx'

function App() {
  const [page, setPage] = useState('start')

  if (page === 'select') {
    return <Select />
  }

  return <Start onStart={() => setPage('select')} />
}

export default App
