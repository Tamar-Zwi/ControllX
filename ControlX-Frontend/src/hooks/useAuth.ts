import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  
  // שולף את המשתמש פעם אחת בצורה בטוחה
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // פונקציית התנתקות מסודרת
  const logout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // מחזיר את המשתמש, פונקציית ההתנתקות, ומשתנה בוליאני שאומר אם מחוברים
  return { 
    user, 
    logout, 
    isAuthenticated: !!user 
  };
};