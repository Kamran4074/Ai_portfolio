import { Route, Routes } from 'react-router-dom'
import Hero from './components/Hero'
import NavBar from './components/NavBar'
import ChatWidget from './components/ChatWidget'
import ProjectsPage from './pages/ProjectsPage'

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
      <ChatWidget />
    </>
  )
}

export default App
