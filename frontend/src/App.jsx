import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage/LandingPage'
import AdminDash from './pages/AdminDashboard/AdminDashPage'
import Nav from './components/Nav'
import { Container, Typography } from '@mui/material'


const App = () => {
  return (
    <div>
      <Container sx={{
         width: { xs: 1, md: 900}
         }}>
        <Typography variant='h1'>Welcome to the DIO: Member Dashboard</Typography>
        <Nav />
        <Routes>
          <Route path="/" element={ <LandingPage/> }/>
          <Route path="/admin" element ={ <AdminDash/> }/>
        </Routes>
      </Container>
    </div>

  )
}

export default App
