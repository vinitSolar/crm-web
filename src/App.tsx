import { Providers, AppRoutes } from '@/core';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <Providers>
            <AppRoutes />
            <ToastContainer />
        </Providers>
    );
}

export default App;
