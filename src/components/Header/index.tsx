import React, { useEffect, useState } from 'react';
import {
  AppBar,
  IconButton,
  Button,
  Container,
  Toolbar,
  Box,
  MenuItem,
  MenuList,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  Stack,
  Typography,
  Tooltip,
} from '@mui/material';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppRoutes, LS_LOGIN } from '../../constants';
import HomeIcon from './home-icon.styled';
import { TimeoutId } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types';
import LangSwitch from './switch.styled';

let timeout: TimeoutId;

function Header() {
  const navigate = useNavigate();
  const [isStickied, setStickied] = useState(false);
  const [openAuthMenu, setOpenAuthMenu] = React.useState<boolean>(false);
  const anchorAuthRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    window.onscroll = () => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        const val = window.scrollY > 10;
        setStickied(val);
        console.log(isStickied);
      }, 10);
    };
  });

  const handleLogout = () => {
    window.localStorage.clear();
    setOpenAuthMenu(false);
    navigate(AppRoutes.WELCOME);
  };

  const handleToggleAuthMenu = () => {
    setOpenAuthMenu((prevOpen) => !prevOpen);
  };

  const handleCloseAuthMenu = () => {
    setOpenAuthMenu(false);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        height: !isStickied ? '64px' : '54px',
        transition: 'height 0.3s',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          height: '100%',
          alignItems: 'center',
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: { xs: '100%' }, display: 'flex', flexGrow: 1 }}>
          <Tooltip title={'boards'}>
            <IconButton component={RouterLink} to={AppRoutes.MAIN} aria-label="home-icon">
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ marginRight: '5px' }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>En</Typography>
            <LangSwitch />
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Ru</Typography>
          </Stack>
          <Tooltip title={'create board'}>
            <IconButton component={RouterLink} to={AppRoutes.BOARD} aria-label="create new board">
              <NoteAddOutlinedIcon color="secondary" />
            </IconButton>
          </Tooltip>
          <Button
            ref={anchorAuthRef}
            id="composition-button"
            startIcon={<PersonIcon color="secondary" />}
            color="inherit"
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
            endIcon={
              <KeyboardArrowDownIcon
                color="secondary"
                onClick={handleToggleAuthMenu}
                sx={{
                  transform: `rotate(${openAuthMenu ? '180' : '0'}deg)`,
                  transition: '0.5s',
                }}
              />
            }
          >
            {window.localStorage.getItem(LS_LOGIN)}
          </Button>
          <Popper
            open={openAuthMenu}
            anchorEl={anchorAuthRef.current}
            role={undefined}
            placement="bottom-start"
            transition
            style={{ zIndex: '1110' }}
          >
            {({ TransitionProps, placement }) => (
              <Grow
                in={TransitionProps?.in}
                onEnter={TransitionProps?.onEnter}
                onExited={TransitionProps?.onExited}
                style={{
                  transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleCloseAuthMenu}>
                    <MenuList
                      autoFocusItem={openAuthMenu}
                      id="composition-menu"
                      aria-labelledby="composition-button"
                    >
                      <MenuItem onClick={handleCloseAuthMenu}>
                        <Button
                          startIcon={<ModeEditIcon color="success" />}
                          component={RouterLink}
                          to={AppRoutes.EDIT}
                          sx={{ textTransform: 'none', color: 'inherit' }}
                        >
                          Edit profile
                        </Button>
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                        <Button
                          startIcon={<LogoutIcon color="error" />}
                          sx={{ textTransform: 'none', color: 'inherit' }}
                        >
                          Log out
                        </Button>
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
