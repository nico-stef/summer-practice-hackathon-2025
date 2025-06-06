import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from '../src/pages/Login'
import SignUp from './pages/SignUp';
import AddFile from './pages/AddFile'
import SeeFiles from './pages/SeeFiles';
import File from './pages/File';
import Groups from './pages/Groups'
import GroupPage from './pages/GroupPage';
import PrivateRoutes from './components/PrivateRoutes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />

        <Route element={<PrivateRoutes />}>
          <Route path="/add" element={<AddFile />} />
          <Route path="/seeFiles" element={<SeeFiles />} />
          <Route path="/file/:id" element={<File />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/group/:groupId/:groupName" element={<GroupPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;