import { Outlet, useParams } from 'react-router-dom';
import NavColumn from './NavColumn';
import { Box, Container } from '@mui/material';

const AdminLayout = () => {
    const { org } = useParams();

    return (
        <Container sx={{ display: 'flex'}}>
            <NavColumn pageTitle={"Admin Links"} orgType={org} />
            <Outlet />
        </Container>
    );
};

export default AdminLayout;
