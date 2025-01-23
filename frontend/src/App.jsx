import { Routes, Route } from 'react-router-dom'
import { Container, Typography } from '@mui/material'
import LandingPage from './pages/LandingPage/LandingPage'
import AdminDash from './pages/AdminDashboard/AdminDashPage'
import AcctSetup from './pages/AccountSetup/AccountSetupPage'
import Nav from './components/Nav'
import AppBar from './components/AppBar'


const App = () => {
    return (
        <>
            <AppBar />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/admin" element={<AdminDash />} />
                <Route path="/acctSetup" element={<AcctSetup />} />
            </Routes>
        </>

    )
}

export default App
