import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Start from './pages/Start'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Select from './pages/Select'
import PlaceDetail from './pages/PlaceDetail'
import Feed from './pages/Feed'
import PhotoFrame from './pages/PhotoFrame'

function SelectPage({ onSelect }) {
  const navigate = useNavigate()

  return (
    <Select
      onSelect={(idol) => {
        onSelect(idol)
        navigate('/home')
      }}
    />
  )
}

function StartOverlay({ onStart }) {
  const navigate = useNavigate()

  return (
    <Start
      onStart={() => {
        onStart()
        navigate('/select')
      }}
    />
  )
}

function App() {
  const [started, setStarted] = useState(false)
  const [selectedIdol, setSelectedIdol] = useState(null)
  const [, setIsLoggedIn] = useState(false)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/select"
          element={
            <SelectPage
              onSelect={(idol) => {
                setSelectedIdol(idol)
                setStarted(true)
              }}
            />
          }
        />
        <Route
          path="/home"
          element={
            <Home
              selectedIdol={selectedIdol}
              onIdolChange={setSelectedIdol}
              started={started}
            />
          }
        />
        <Route path="/place/:id" element={<PlaceDetail />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/photoframe" element={<PhotoFrame />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      {!started && <StartOverlay onStart={() => setStarted(true)} />}
    </BrowserRouter>
  )
}

export default App
