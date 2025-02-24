import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import "./Navbar.css"; // Ensure this CSS file is imported
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear the auth token when logging out
        logout();
        navigate("/login"); // Redirect to login page after logout
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: "#FFFFFF" }}>
            <Toolbar>
                <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                    {/* SVG logo */}
                    <Link
                        to={isLoggedIn ? "/inventory" : "/"}
                        style={{ textDecoration: "none" }}>
                        <img
                            src="/BOMALOGO.svg"
                            alt="Logo"
                            style={{ width: "230px", marginRight: "10px" }}
                        />
                    </Link>
                </Box>

                {/* Conditional rendering for logged-in state */}
                {isLoggedIn ? (
                    <>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/add-device"
                            sx={{
                                fontFamily: "Poppins",
                                fontWeight: "medium",
                                color: "#e53631",
                            }}>
                            Add Device
                        </Button>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/initiate-sale"
                            sx={{
                                fontFamily: "Poppins",
                                fontWeight: "medium",
                                color: "#e53631",
                            }}>
                            Initiate Sale
                        </Button>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/recall-receipt"
                            sx={{
                                fontFamily: "Poppins",
                                fontWeight: "medium",
                                color: "#e53631",
                            }}>
                            Recall Receipt
                        </Button>
                        <Button
                            color="inherit"
                            onClick={handleLogout}
                            sx={{
                                fontFamily: "Poppins",
                                fontWeight: "medium",
                                color: "#e53631",
                            }}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/login"
                            sx={{
                                fontFamily: "Poppins",
                                fontWeight: "medium",
                                color: "#e53631",
                            }}>
                            Login
                        </Button>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/register"
                            sx={{
                                fontFamily: "Poppins",
                                fontWeight: "medium",
                                color: "#e53631",
                            }}>
                            Register
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;