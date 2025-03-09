import React, { useState, useEffect } from "react";
import { AppBar, IconButton, Typography, Box, Avatar, Tooltip, Menu, MenuItem, Button, Toolbar } from "@mui/material";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/user_api";

function isConnected() {
  const username = localStorage.getItem("username");
  return username !== null && username.trim() !== "";
}

const ResponsiveAppBar = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(localStorage.getItem("imageUrl"));
  const navigate = useNavigate();

  const pages = isConnected() ? ["Feed", "My Posts", "Logout"] : [];
  const settings = ["My Profile"];

  // Update imageUrl every 2 seconds to ensure it reflects any changes in localStorage
  useEffect(() => {
    const intervalId = setInterval(() => {
      const storedImageUrl = localStorage.getItem("imageUrl");
      if (storedImageUrl && storedImageUrl !== imageUrl) {
        setImageUrl(storedImageUrl); // Update the image URL from localStorage
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [imageUrl]); // Only re-run effect when imageUrl changes

  const handleNavClick = (page: string) => {
    switch (page) {
      case "Feed":
        navigate("/feed");
        break;
      case "My Posts":
        navigate("/my-posts");
        break;
      case "Logout":
        logout();
        navigate("/");
        break;
      default:
        break;
    }
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
        <MovieFilterIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1, marginLeft: "20px" }} />
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/feed"
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

        <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
          <IconButton onClick={handleOpenNavMenu} color="inherit">
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            {pages.map((page) => (
              <MenuItem key={page} onClick={() => handleNavClick(page)}>
                <Typography textAlign="center">{page}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            {pages.map((page) => (
              <Button key={page} onClick={() => handleNavClick(page)} sx={{ my: 2, color: "white", mx: 1 }}>
                {page}
              </Button>
            ))}
          </Box>

          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, mr: 2 }}>
              <Avatar alt="User Avatar" src={imageUrl || "/default-avatar.png"} />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={() => setAnchorElUser(null)}
          >
            {settings.map((setting) => (
              <MenuItem key={setting} onClick={() => handleCloseUserMenu(setting)}>
                <Typography textAlign="center">{setting}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ResponsiveAppBar;
