import React, { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Alert,
  AlertColor,
} from "@mui/material";

import {
  Edit,
  Delete,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

import Navbar from "@/components/Navbar"; // Adjust import path if needed
import Footer from "@/components/Footer"; // Adjust import path if needed

import { supabase } from "../lib/supabaseClient"; // Adjust import path if needed

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
    background: { default: "#f0f4f8", paper: "#ffffff" },
    success: { main: "#2e7d32" },
  },
  typography: { fontFamily: "'Roboto', sans-serif" },
});

export default function Dashboard() {
  const [members, setMembers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    membershipType: "",
    startDate: "",
    expiryDate: "",
    photo: "",
  });
  const [membershipFilter, setMembershipFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortByDaysRemaining, setSortByDaysRemaining] = useState(false);

  const [attentionOpen, setAttentionOpen] = useState(false);

  // Fetch members from Supabase
  const fetchMembers = async () => {
    const { data, error } = await supabase.from("members").select("*");
    if (error) {
      setSnackbar({
        open: true,
        message: "Failed to load members from database.",
        severity: "error",
      });
      setMembers([]);
    } else {
      setMembers(data || []);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();

  const getDaysRemaining = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 3600 * 24));
  };

  const getExpiringSoonMembers = () => {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    return members.filter((member) => {
      const expiry = new Date(member.expiryDate);
      return expiry >= now && expiry <= sevenDaysLater;
    });
  };

  // Delete member from Supabase
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete member.",
        severity: "error",
      });
    } else {
      setMembers(members.filter((member) => member.id !== id));
      setSnackbar({
        open: true,
        message: "Member deleted successfully!",
        severity: "info",
      });
    }
  };

  // Handle form input change
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setNewMember({ ...newMember, [name]: value });
  };

  // Add or update member in Supabase
  const handleAddOrUpdateMember = async () => {
    if (!newMember.name || !newMember.email) {
      setSnackbar({
        open: true,
        message: "Name and Email are required.",
        severity: "warning",
      });
      return;
    }

    if (editId !== null) {
      const { error } = await supabase
        .from("members")
        .update(newMember)
        .eq("id", editId);

      if (error) {
        setSnackbar({
          open: true,
          message: "Failed to update member.",
          severity: "error",
        });
        return;
      }

      setSnackbar({
        open: true,
        message: "Member updated successfully!",
        severity: "success",
      });
    } else {
      const { error } = await supabase.from("members").insert([newMember]);

      if (error) {
        setSnackbar({
          open: true,
          message: "Failed to add member.",
          severity: "error",
        });
        return;
      }

      setSnackbar({
        open: true,
        message: "New member added successfully!",
        severity: "success",
      });
    }

    setOpen(false);
    setEditId(null);
    setNewMember({
      name: "",
      email: "",
      phone: "",
      membershipType: "",
      startDate: "",
      expiryDate: "",
      photo: "",
    });
    fetchMembers();
  };

  // Open edit dialog with member data
  const handleEdit = (member: any) => {
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone,
      membershipType: member.membershipType,
      startDate: member.startDate,
      expiryDate: member.expiryDate,
      photo: member.photo || "",
    });
    setEditId(member.id);
    setOpen(true);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const toggleSortName = () => {
    if (sortByDaysRemaining) {
      setSortByDaysRemaining(false);
      setSortDirection("asc");
    } else {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    }
  };

  const toggleSortDaysRemaining = () => {
    if (sortByDaysRemaining) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortByDaysRemaining(true);
      setSortDirection("asc");
    }
  };

  const filteredMembers = Array.isArray(members)
    ? members
      .filter((member) => {
        const matchesSearch = Object.values(member).some((value) =>
          value
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
        const matchesMembership =
          !membershipFilter || member.membershipType === membershipFilter;
        const matchesStatus =
          !statusFilter ||
          (statusFilter === "Expired" && isExpired(member.expiryDate)) ||
          (statusFilter === "Active" && !isExpired(member.expiryDate));
        return matchesSearch && matchesMembership && matchesStatus;
      })
      .sort((a, b) => {
        if (sortByDaysRemaining) {
          const aDays = getDaysRemaining(a.expiryDate);
          const bDays = getDaysRemaining(b.expiryDate);
          if (sortDirection === "asc") {
            return aDays - bDays;
          } else {
            return bDays - aDays;
          }
        } else {
          if (sortDirection === "asc") {
            return a.name.localeCompare(b.name);
          } else {
            return b.name.localeCompare(a.name);
          }
        }
      })
    : [];

  const statusCounts = Array.isArray(members)
    ? members.reduce(
      (acc: Record<string, number>, member) => {
        const status = isExpired(member.expiryDate) ? "Expired" : "Active";
        acc[status] = (acc[status] || 0) + 1;
        acc[member.membershipType] = (acc[member.membershipType] || 0) + 1;
        return acc;
      },
      { Expired: 0, Active: 0, Basic: 0, Standard: 0, Premium: 0 }
    )
    : { Expired: 0, Active: 0, Basic: 0, Standard: 0, Premium: 0 };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Box sx={{ padding: 3, minHeight: "80vh" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" fontWeight={600}>
            FitTrack Pro Dashboard
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} mb={4} justifyContent="center" alignItems="stretch">
          {[
            {
              label: "Total Members",
              value: statusCounts.Active + statusCounts.Expired,
              color: "text.primary",
            },
            {
              label: "Active Members",
              value: statusCounts.Active,
              color: "success.main",
            },
            {
              label: "Expired Members",
              value: statusCounts.Expired,
              color: "error.main",
            },
            { label: "Basic Members", value: statusCounts.Basic, color: "primary.main" },
            {
              label: "Standard Members",
              value: statusCounts.Standard,
              color: "primary.dark",
            },
            {
              label: "Premium Members",
              value: statusCounts.Premium,
              color: "secondary.main",
            },
          ].map((card) => (
            <Grid
              item
              key={card.label}
              xs={12}
              sm={6}
              md={2}
              display="flex"
            >
              <Card
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: 3,
                  borderRadius: 2,
                  minHeight: 120,
                  width: "100%",
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {card.label}
                  </Typography>
                  <Typography variant="h4" sx={{ color: card.color, fontWeight: "bold" }}>
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters and buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "space-between",
            flexWrap: "nowrap",
            mb: 3,
            alignItems: "center",
          }}
        >
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Search for members..."
              variant="outlined"
              size="medium"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}

            />
          </Grid>

          <Button
            variant="outlined"
            color="secondary"
            size="large"

            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setMembershipFilter("");
            }}
            sx={{ height: "56px", alignSelf: "center" }}
          >
            Reset Filters
          </Button>

          <Grid item xs={12} sm={12} md={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ height: "56px" }}
              onClick={() => {
                setNewMember({
                  name: "",
                  email: "",
                  phone: "",
                  membershipType: "",
                  startDate: "",
                  expiryDate: "",
                  photo: "",
                });
                setEditId(null);
                setOpen(true);
              }}
            >
              + Add New Member
            </Button>
          </Grid>

          <Grid item xs={12} sm={12} md={2}>
            <Button
              variant="outlined"
              color="error"
              size="large"
              fullWidth
              sx={{ height: "56px" }}
              onClick={() => setAttentionOpen(true)}
            >
              Attention
            </Button>
          </Grid>
        </Box>

        {/* Membership and Status Filters */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "flex-start",
            flexWrap: "nowrap",
            mb: 3,
          }}
        >
          <FormControl sx={{ minWidth: 160 }} size="medium" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Expired">Expired</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }} size="medium" fullWidth>
            <InputLabel>Membership</InputLabel>
            <Select
              value={membershipFilter}
              label="Membership"
              onChange={(e) => setMembershipFilter(e.target.value)}
              fullWidth
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Basic">Basic</MenuItem>
              <MenuItem value="Standard">Standard</MenuItem>
              <MenuItem value="Premium">Premium</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Members Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={toggleSortName}
                >
                  Name
                  {!sortByDaysRemaining && (
                    sortDirection === "asc" ? (
                      <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} />
                    ) : (
                      <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                    )
                  )}
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Membership Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={toggleSortDaysRemaining}
                >
                  Days Left
                  {sortByDaysRemaining ? (
                    sortDirection === "asc" ? (
                      <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} />
                    ) : (
                      <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                    )
                  ) : null}
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.map((member) => {
                const daysRemaining = getDaysRemaining(member.expiryDate);
                return (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Link
                        to={`/member/${member.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        {member.photo ? (
                          <Avatar
                            alt={member.name}
                            src={member.photo}
                            sx={{ width: 40, height: 40, cursor: "pointer" }}
                          />
                        ) : (
                          <Avatar sx={{ width: 40, height: 40, cursor: "pointer" }}>
                            {member.name.charAt(0).toUpperCase()}
                          </Avatar>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/member/${member.id}`}
                        style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                      >
                        {member.name}
                      </Link>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{member.membershipType}</TableCell>
                    <TableCell>{member.startDate}</TableCell>
                    <TableCell>{member.expiryDate}</TableCell>
                    <TableCell>
                      {daysRemaining > 0 ? (
                        <Typography
                          sx={{
                            color:
                              daysRemaining <= 7
                                ? "error.main"
                                : "success.main",
                            fontWeight: daysRemaining <= 7 ? "bold" : "normal",
                          }}
                        >
                          {daysRemaining}
                        </Typography>
                      ) : (
                        <Typography sx={{ color: "text.disabled" }}>–</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isExpired(member.expiryDate) ? "Expired" : "Active"}
                        color={isExpired(member.expiryDate) ? "error" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="warning" onClick={() => handleEdit(member)} size="large">
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(member.id)} size="large">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Member Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editId !== null ? "Edit Member" : "Add New Member"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Name" name="name" fullWidth value={newMember.name} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Email" name="email" fullWidth value={newMember.email} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Phone" name="phone" fullWidth value={newMember.phone} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Photo URL"
                  name="photo"
                  fullWidth
                  value={newMember.photo}
                  onChange={handleInputChange}
                  placeholder="https://example.com/photo.jpg"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="membership-type-label">Membership Type</InputLabel>
                  <Select
                    labelId="membership-type-label"
                    label="Membership Type"
                    name="membershipType"
                    value={newMember.membershipType}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Basic">Basic</MenuItem>
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Premium">Premium</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newMember.startDate}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newMember.expiryDate}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdateMember} color="primary" variant="contained">
              {editId !== null ? "Update Member" : "Add Member"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Attention Dialog */}
        <Dialog
          open={attentionOpen}
          onClose={() => setAttentionOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Members Expiring Within 7 Days</DialogTitle>
          <DialogContent dividers>
            {getExpiringSoonMembers().length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Membership Type</TableCell>
                    <TableCell>Days Remaining</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getExpiringSoonMembers().map((member) => {
                    const expiryDate = new Date(member.expiryDate);
                    const today = new Date();
                    const timeDiff = expiryDate.getTime() - today.getTime();
                    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    return (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.expiryDate}</TableCell>
                        <TableCell>{member.membershipType}</TableCell>
                        <TableCell>
                          {daysRemaining > 0 ? (
                            <Typography sx={{ color: "error.main", fontWeight: "bold" }}>
                              {daysRemaining}
                            </Typography>
                          ) : (
                            <Typography sx={{ color: "text.disabled" }}>–</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <Typography>No members expiring within the next 7 days.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAttentionOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
      <Footer />
    </ThemeProvider>
  );
}
