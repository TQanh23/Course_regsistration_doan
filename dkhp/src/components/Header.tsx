import React, { useState } from 'react';
import { Menu, MenuItem, PopoverOrigin } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';

interface HeaderProps {
  title?: string;
}

const menuPosition = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'right',
  } as PopoverOrigin,
  transformOrigin: {
    vertical: 'top',
    horizontal: 'right',
  } as PopoverOrigin,
};

const Header: React.FC<HeaderProps> = ({ title = "Welcome to HUCE for admin" }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThongTinCaNhan = () => {
    handleClose();
    navigate('/thong-tin-ca-nhan');
  };
  
  const handleDoiMatKhau = () => {
    handleClose();
    navigate('/doi-mat-khau');
  };
  
  const handleLogout = async () => {
    try {
      handleClose();
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // You could show an error message to the user here
    }
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src="/huce-logo.png" alt="Logo" className="logo" />
      </div>
      <h1 className="welcome-text">{title}</h1>
      <div className="user-profile">
        <div className="user-avatar" onClick={handleClick}>
          <img src="/avatar.png" alt="User" />
        </div>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          {...menuPosition}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
              mt: 1.5,
              borderRadius: 2,
              width: 280,
              '& .MuiMenuItem-root': {
                padding: 2,
                fontSize: 18,
                fontWeight: 600,
                color: '#0066cc',
                justifyContent: 'center',
                height: 50,
                userSelect: 'none',
                backgroundColor: '#fff !important',
                '&.Mui-selected': {
                  backgroundColor: '#fff !important',
                },
                '&.Mui-focusVisible': {
                  backgroundColor: '#fff !important',
                },
                '&:hover': {
                  backgroundColor: '#f5f5f5 !important',
                },
              },
            },
          }}
        >
          <MenuItem onClick={handleThongTinCaNhan} disableGutters>Thông tin cá nhân</MenuItem>
          <MenuItem onClick={handleDoiMatKhau} disableGutters>Đổi mật khẩu</MenuItem>
          <MenuItem onClick={handleLogout} disableGutters>Đăng xuất</MenuItem>
        </Menu>
      </div>
    </header>
  );
};

export default Header;