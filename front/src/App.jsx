import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Start from './pages/Start'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Select from './pages/Select'
import PlaceDetail from './pages/PlaceDetail'
import Feed from './pages/Feed'
import Photo from './pages/Photo'
import PhotoFrame from './pages/PhotoFrame'
import PhotoSelect from './pages/PhotoSelect'
import PostRegister from './pages/PostRegister'

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
        navigate('/home')
      }}
    />
  )
}

function StartOverlayGate({ started, onStart }) {
  const location = useLocation()
  const hiddenPaths = ['/photoselect', '/photo', '/postregister']

  if (started || hiddenPaths.includes(location.pathname)) return null

  return <StartOverlay onStart={onStart} />
}

function App() {
  const [started, setStarted] = useState(false)
  const [selectedIdol, setSelectedIdol] = useState(null)
  const [skipHomeIdolPrompt, setSkipHomeIdolPrompt] = useState(false)
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
                setSkipHomeIdolPrompt(false)
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
              skipIdolPrompt={skipHomeIdolPrompt}
            />
          }
        />
        <Route path="/place/:id" element={<PlaceDetail />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/photo" element={<Photo />} />
        <Route path="/photoframe" element={<PhotoFrame />} />
        <Route path="/photoselect" element={<PhotoSelect selectedIdol={selectedIdol} />} />
        <Route
          path="/postregister"
          element={
            <PostRegister
              selectedIdol={selectedIdol}
              onReturnHome={() => {
                setStarted(true)
                setSkipHomeIdolPrompt(true)
              }}
            />
          }
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      <StartOverlayGate started={started} onStart={() => setStarted(true)} />
    </BrowserRouter>
  )
}

export default App
