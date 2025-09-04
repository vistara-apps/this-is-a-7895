import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import CreateAds from './pages/CreateAds'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-bg">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateAds />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </AppProvider>
  )
}

export default App