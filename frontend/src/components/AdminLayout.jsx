import { Outlet, useParams } from 'react-router-dom';
import HorizontalNavTabs from './HorizontalNavTabs';
import { Container } from '@mui/material';

/**
 * AdminLayout.jsx
 * 
 * This React component serves as the layout for the admin dashboard pages. It includes a horizontal navigation bar
 * for navigating between different sections of the admin dashboard and renders the appropriate child components
 * based on the current route.
 * 
 * Key Features:
 * - Displays a horizontal navigation bar (`HorizontalNavTabs`) for admin pages.
 * - Dynamically updates the navigation bar based on the organization type from the URL parameters.
 * - Uses React Router's `Outlet` to render child components for the selected admin page.
 * 
 * Props:
 * - None
 * 
 * Dependencies:
 * - React Router for route management and extracting URL parameters.
 * - Material-UI components for layout and styling.
 * - Custom component: `HorizontalNavTabs` for navigation.
 * 
 * Hooks:
 * - React Router's `useParams`: Extracts the organization type from the URL.
 * 
 * @component
 */
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
