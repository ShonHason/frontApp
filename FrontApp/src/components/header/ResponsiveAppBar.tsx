import React from "react";
import {
  AppBar,
  IconButton,
  Typography,
  Menu,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Toolbar,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/user_api";

function isConnected() {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken !== null && accessToken.trim() !== "";
}

const ResponsiveAppBar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  const navigate = useNavigate();

  // Dynamically calculate `pages` based on the connection state
  const pages = isConnected() ? ["Feed", "My Posts", "Logout"] : [];

  const settings = ["My Profile"];

  // Handler for navigation buttons
  const handleNavClick = (page: string) => {
    switch (page) {
      case "Feed":
        navigate("/feed");
        break;
      case "My Posts":
        // Updated to match /my-posts route
        navigate("/my-posts");
        break;
      case "Logout":
        logout();
        navigate("/");
        break;
      default:
        break;
    }
    // Close the nav menu if it's open
    handleCloseNavMenu();
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (setting: string) => {
    if (setting === "My Profile") {
      navigate("/myprofile");
    }
    setAnchorElUser(null);
  };

  return (
    <AppBar position="fixed" sx={{ width: "100%" }}>
      <Toolbar disableGutters>
        {/* Desktop Logo */}
        <MovieFilterIcon
          sx={{
            display: { xs: "none", md: "flex" },
            mr: 1,
            marginLeft: "20px",
          }}
        />
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="#"
          sx={{
            mr: 2,
            display: { xs: "none", md: "flex" },
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          FireFilm
        </Typography>

        {/* Display text only when connected */}
        {isConnected() && (
          <Typography sx={{ marginLeft: "20px", color: "white" }}>
            ברוך הבא!
          </Typography>
        )}

        {/* Mobile Menu Icon */}
        <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            aria-label="menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            {pages.map((page) => (
              <MenuItem key={page} onClick={() => handleNavClick(page)}>
                <Typography sx={{ textAlign: "center" }}>{page}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Right-Aligned Navigation Links and Avatar */}
        {isConnected() && (
          <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
            {/* Desktop Navigation Links */}
            <Box
              sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
            >
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={() => handleNavClick(page)}
                  sx={{
                    my: 2,
                    color: "white",
                    display: "block",
                    marginRight: "5px",
                    marginLeft: "5px",
                  }}
                >
                  {page}
                </Button>
              ))}
            </Box>

            <Tooltip title="Open settings">
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{ p: 0, marginRight: "20px" }}
              >
                <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={() => setAnchorElUser(null)}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => handleCloseUserMenu(setting)}
                >
                  <Typography sx={{ textAlign: "center" }}>
                    {setting}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default ResponsiveAppBar;
