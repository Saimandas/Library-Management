import { createRoot } from 'react-dom/client'
import './index.css'
import App from './User.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Homepage from './pages/Users/Homepage.jsx'
import LoginPage from './pages/Users/LoginPage.jsx'
import RegisterPage from './pages/Users/RegisterPage.jsx'
import Dashboard from './pages/admin/DashBoard.jsx'
import AddBooks from './pages/admin/AddBook.jsx'
import Maintenance from './pages/Users/MaintainancePage.jsx'
import Admin from './Admin.jsx'
import Users from './pages/admin/ViewUsers.jsx'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import Books from './pages/admin/ViewBooks.jsx'

createRoot(document.getElementById('root')).render(
  
   <Provider store={store}>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<App/>}>
        <Route index element={<Homepage/>} />
        <Route path='login' element={<LoginPage/>}/>
      <Route path='register' element={<RegisterPage/>}/>
      <Route path='*' element={<Maintenance/>}/>
      </Route>
      
      <Route path='/admin' element={<Admin/>}>
        <Route index element={<Dashboard/>}/>
        <Route path="add-books" element={<AddBooks/>}/>
        <Route path="view-users" element={<Users/>}/>
        <Route path="books" element={<Books/>}/>
      </Route>
    </Routes>
   </BrowserRouter>
   </Provider>
 )
