import { Outlet, useParams } from 'react-router-dom';
import HorizontalNavTabs from './TabRow';
import { Container } from '@mui/material';

const AdminLayout = () => {
    const { org } = useParams();

    return (
        <Container>
            <HorizontalNavTabs
                orgType={org}
            />
            <Outlet />
        </Container>
    );
};

export default AdminLayout;
