import { useState } from "react";
import Cookies from "js-cookie";
import "./App.css";

function App() {
    const [page, setPage] = useState("login");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [profile, setProfile] = useState(null);

    // ==========================
    // REGISTER
    // ==========================

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message);
                return;
            }

            setMessage(
                "Registration successful! Please login."
            );

            setUsername("");
            setPassword("");

            // Move to login page
            setPage("login");

        } catch (error) {
            setMessage("Unable to connect to server");
        }
    };

    // ==========================
    // LOGIN
    // ==========================

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message);
                return;
            }

            // Store JWT in cookie
            Cookies.set("token", data.token, {
                expires: 1,
                sameSite: "strict",
            });

            setMessage("Login successful!");

            setUsername("");
            setPassword("");

            // Move to profile page
            setPage("profile");

        } catch (error) {
            setMessage("Unable to connect to server");
        }
    };

    // ==========================
    // GET PROFILE
    // ==========================

    const handleProfile = async () => {
        setMessage("");

        const token = Cookies.get("token");

        if (!token) {
            setMessage("No token found. Please login.");
            setPage("login");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/profile",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message);
                return;
            }

            setProfile(data.user);

        } catch (error) {
            setMessage("Unable to connect to server");
        }
    };

    // ==========================
    // LOGOUT
    // ==========================

    const handleLogout = () => {
        Cookies.remove("token");

        setProfile(null);
        setMessage("Logged out successfully");
        setPage("login");
    };

    // ==========================
    // REGISTER PAGE
    // ==========================

    if (page === "register") {
        return (
            <div className="container">

                <div className="auth-box">

                    <h1>Register</h1>

                    <form onSubmit={handleRegister}>

                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />

                        <button type="submit">
                            Register
                        </button>

                    </form>

                    {message && (
                        <p>{message}</p>
                    )}

                    <p>
                        Already have an account?
                    </p>

                    <button
                        onClick={() => {
                            setMessage("");
                            setPage("login");
                        }}
                    >
                        Login
                    </button>

                </div>

            </div>
        );
    }

    // ==========================
    // LOGIN PAGE
    // ==========================

    if (page === "login") {
        return (
            <div className="container">

                <div className="auth-box">

                    <h1>Login</h1>

                    <form onSubmit={handleLogin}>

                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />

                        <button type="submit">
                            Login
                        </button>

                    </form>

                    {message && (
                        <p>{message}</p>
                    )}

                    <p>
                        Don't have an account?
                    </p>

                    <button
                        onClick={() => {
                            setMessage("");
                            setPage("register");
                        }}
                    >
                        Register
                    </button>

                </div>

            </div>
        );
    }

    // ==========================
    // PROFILE PAGE
    // ==========================

    return (
        <div className="container">

            <div className="auth-box">

                <h1>Welcome 👋</h1>

                <button onClick={handleProfile}>
                    Get Protected Profile
                </button>

                {profile && (
                    <div className="profile">

                        <h3>Profile</h3>

                        <p>
                            ID: {profile.id}
                        </p>

                        <p>
                            Username: {profile.username}
                        </p>

                    </div>
                )}

                {message && (
                    <p>{message}</p>
                )}

                <button onClick={handleLogout}>
                    Logout
                </button>

            </div>

        </div>
    );
}

export default App;