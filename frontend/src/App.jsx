import { Routes, Route } from 'react-router-dom'

import LandingPage from './pages/LandingPage/LandingPage'
import AdminDash from './components/DataTable'
import Nav from './components/Nav'


const App = () => {
  return (
    <div>
      <Nav />
      <Routes>
        <Route path="/" element={ <LandingPage/> }/>
        <Route path="/admin" element ={ <AdminDash/> }/>
      </Routes>
    </div>

  )
}

export default App
