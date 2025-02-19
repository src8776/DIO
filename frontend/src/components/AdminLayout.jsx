import { Outlet, useParams } from 'react-router-dom';
import NavColumn from './NavColumn';
import { Container } from '@mui/material';

const AdminLayout = () => {
    const { org } = useParams();

    return (
        <Container sx={{ display: 'flex' }}>
            <NavColumn pageTitle={"Admin Tabs"} orgType={org} sx={{ display: { xs: "none", sm: "block" } }} />
            <Outlet />
        </Container>
    );
};

export default AdminLayout;
