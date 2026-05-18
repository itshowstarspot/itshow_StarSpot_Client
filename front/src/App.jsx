import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Start from './pages/Start'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PlaceDetail from './pages/PlaceDetail'
import Feed from './pages/Feed'
import PhotoFrame from './pages/PhotoFrame'

function App() {
  const [started, setStarted] = useState(false)
  const [selectedIdol, setSelectedIdol] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/signup" element={<Signup />} />
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

      {!started && <Start onStart={() => setStarted(true)} />}
    </BrowserRouter>
  )
}

export default App
