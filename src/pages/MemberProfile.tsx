import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Avatar,
    Grid,
    Paper,
    Snackbar,
    Alert,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabaseClient"; // Adjust path accordingly
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MemberProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "warning" | "info",
    });

    // State for note input
    const [note, setNote] = useState("");
    // State for notes list
    const [notes, setNotes] = useState<any[]>([]);

    useEffect(() => {
        const fetchMember = async () => {
            setLoading(true);
            setError("");
            const { data, error } = await supabase
                .from("members")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                setError("Failed to load member data.");
                setMember(null);
                setNotes([]);
            } else {
                setMember(data);
                setNotes(data.notes || []);
            }
            setLoading(false);
        };
        if (id) fetchMember();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!member) return;
        const { name, value } = e.target;
        setMember({ ...member, [name]: value });
    };

    const handleSave = async () => {
        if (!member) return;
        const { error } = await supabase
            .from("members")
            .update({
                name: member.name,
                email: member.email,
                phone: member.phone,
                membershipType: member.membershipType,
                startDate: member.startDate,
                expiryDate: member.expiryDate,
                photo: member.photo,
                notes: notes, // preserve existing notes
            })
            .eq("id", id);

        if (error) {
            setSnackbar({
                open: true,
                message: "Failed to update member.",
                severity: "error",
            });
        } else {
            setSnackbar({
                open: true,
                message: "Member updated successfully!",
                severity: "success",
            });
        }
    };

    // Add a new note and update backend
    const handleAddNote = async () => {
        if (note.trim() === "" || !member) return;

        const newNote = {
            id: Date.now(),
            text: note.trim(),
            date: new Date().toLocaleString(),
        };

        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        setNote("");

        const { error } = await supabase
            .from("members")
            .update({ notes: updatedNotes })
            .eq("id", id);

        if (error) {
            setSnackbar({
                open: true,
                message: "Failed to add note.",
                severity: "error",
            });
        } else {
            setSnackbar({
                open: true,
                message: "Note added successfully!",
                severity: "success",
            });
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!member) return <Typography>No member found.</Typography>;

    return (
        <><Navbar /><Box sx={{ maxWidth: 900, mx: "auto", mt: 4, p: 3 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" mb={3}>
                    Member Profile
                </Typography>
                <Grid container spacing={4}>
                    {/* Member form */}
                    <Grid item xs={12} md={7}>
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                            <Avatar
                                alt={member.name}
                                src={member.photo}
                                sx={{ width: 120, height: 120 }}
                            >
                                {!member.photo && member.name.charAt(0).toUpperCase()}
                            </Avatar>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Name"
                                    name="name"
                                    fullWidth
                                    value={member.name}
                                    onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Photo URL"
                                    name="photo"
                                    fullWidth
                                    value={member.photo || ""}
                                    onChange={handleChange}
                                    placeholder="https://example.com/photo.jpg" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Email"
                                    name="email"
                                    fullWidth
                                    value={member.email}
                                    onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Phone"
                                    name="phone"
                                    fullWidth
                                    value={member.phone}
                                    onChange={handleChange} />
                            </Grid>
                          
                           
                          
                            <Grid container spacing={2} sx={{ mt: 2 }} direction="row">
                                <Grid item xs={6}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={handleSave}
                                    >
                                        Save Changes
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => navigate(-1)}
                                    >
                                        Back to Dashboard
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            {/* Notes section */}
            <Grid item xs={12} md={5} sx={{ mt: 5 }}>
                <Typography variant="h6" mb={2}>
                    Admin Notes
                </Typography>
                <TextField
                    label="Write a note"
                    multiline
                    rows={4}
                    fullWidth
                    value={note}
                    onChange={(e) => setNote(e.target.value)} />
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, mb: 3 }}
                    fullWidth
                    onClick={handleAddNote}
                >
                    Post Note
                </Button>

                <Typography variant="subtitle1" mb={1}>
                    Posted Notes
                </Typography>
                {notes.length === 0 ? (
                    <Typography color="textSecondary">No notes yet.</Typography>
                ) : (
                    <List dense>
                        {notes.map((noteItem) => (
                            <ListItem key={noteItem.id} divider>
                                <ListItemText
                                    primary={noteItem.text}
                                    secondary={noteItem.date} />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Grid>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box><Footer /></>
    );
}
