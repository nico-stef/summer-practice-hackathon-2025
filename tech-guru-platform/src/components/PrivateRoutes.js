import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoutes = () => {
  const storedUsername = localStorage.getItem('username');

  return storedUsername ? <Outlet /> : <Navigate to="/login" replace />;
  //outlet e un replacement pt toate rutele puse sub private route
}

export default PrivateRoutes;
