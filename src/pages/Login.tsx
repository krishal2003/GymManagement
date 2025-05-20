import React, { useState } from "react";
import { Button, TextField, Box, Alert, Typography } from "@mui/material";
import { supabase } from "../lib/supabaseClient"; // Adjust path if needed
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (isRegister) {
      // Register user
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        setErrorMsg(error.message);
      } else {
        // Optional: Notify user to check email for confirmation
        alert("Registration successful! Please check your email to confirm.");
        setIsRegister(false);
        setEmail("");
        setPassword("");
      }
    } else {
      // Login user
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        setErrorMsg(error.message);
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <>
      <Navbar />
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ maxWidth: 400, mx: "auto", mt: 6, p: 3, boxShadow: 3, borderRadius: 2, mb: 3 }}
      >
        <Typography variant="h5" textAlign="center" mb={3}>
          {isRegister ? "Register" : "Login"}
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? (isRegister ? "Registering..." : "Signing In...") : (isRegister ? "Register" : "Sign In")}
        </Button>

        <Button
          type="button"
          fullWidth
          color="secondary"
          sx={{ mt: 2 }}
          onClick={() => {
            setErrorMsg("");
            setIsRegister(!isRegister);
          }}
        >
          {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
        </Button>
      </Box>
      <Footer />
    </>
  );
}
