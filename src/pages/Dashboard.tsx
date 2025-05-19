import React, { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
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

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { supabase } from "../lib/supabaseClient";

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
    membershiptype: "",
    startdate: "",
    expirydate: "",
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

  // Pagination states
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

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

  const isExpired = (expirydate: string) => new Date(expirydate) < new Date();

  const getDaysRemaining = (expirydate: string) => {
    const today = new Date();
    const expiry = new Date(expirydate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 3600 * 24));
  };

  const getExpiringSoonMembers = () => {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    return members.filter((member) => {
      const expiry = new Date(member.expirydate);
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
      membershiptype: "",
      startdate: "",
      expirydate: "",
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
      membershiptype: member.membershiptype,
      startdate: member.startdate,
      expirydate: member.expirydate,
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

  // Filter for cards (status + membership + near expiry)
  const [cardFilter, setCardFilter] = useState<string>("");

  // When user clicks card buttons, filter table accordingly
  const handleCardFilter = (filter: string) => {
    setCardFilter(filter);
    // Reset other filters when card filter applied
    setMembershipFilter("");
    setStatusFilter("");
    setSearchTerm("");
    setPage(1); // Reset to page 1 when filter changes
  };

  const filteredMembers = Array.isArray(members)
    ? members
      .filter((member) => {
        // Card filter logic
        if (cardFilter === "Near Expiry") {
          const days = getDaysRemaining(member.expirydate);
          if (days < 0 || days > 7) return false;
        } else if (cardFilter === "Total Members") {
          // no filter
        } else if (cardFilter === "Active Members") {
          if (isExpired(member.expirydate)) return false;
        } else if (cardFilter === "Expired Members") {
          if (!isExpired(member.expirydate)) return false;
        } else if (
          ["Basic Members", "Standard Members", "Premium Members"].includes(cardFilter)
        ) {
          if (
            member.membershiptype.toLowerCase() !==
            cardFilter.split(" ")[0].toLowerCase()
          )
            return false;
        }

        // Then apply the other filters on top of card filter
        const matchesSearch = Object.values(member).some((value) =>
          value
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
        const matchesMembership =
          !membershipFilter || member.membershiptype === membershipFilter;
        const matchesStatus =
          !statusFilter ||
          (statusFilter === "Expired" && isExpired(member.expirydate)) ||
          (statusFilter === "Active" && !isExpired(member.expirydate));
        return matchesSearch && matchesMembership && matchesStatus;
      })
      .sort((a, b) => {
        if (sortByDaysRemaining) {
          const aDays = getDaysRemaining(a.expirydate);
          const bDays = getDaysRemaining(b.expirydate);
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

  // Pagination calculation
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Page change handler
  const handleChangePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const statusCounts = Array.isArray(members)
    ? members.reduce(
      (acc: Record<string, number>, member) => {
        const status = isExpired(member.expirydate) ? "Expired" : "Active";
        acc[status] = (acc[status] || 0) + 1;
        acc[member.membershiptype] = (acc[member.membershiptype] || 0) + 1;
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
          flexWrap="wrap"
          justifyContent="center"
          alignItems="stretch"
          mb={4}
          gap={2}
        >
          {[
            "Active Members",
            "Expired Members",
            "Basic Members",
            "Standard Members",
            "Premium Members",
            "Near Expiry",
            "Total Members",
          ].map((label) => (
            <Button
              key={label}
              variant={cardFilter === label ? "contained" : "outlined"}
              color="primary"
              sx={{ minWidth: 120, flexGrow: 1 }}
              onClick={() => handleCardFilter(label)}
            >
              {label}{" "}
              {(label !== "Near Expiry" && label !== "Total Members") && (
                <Chip
                  label={
                    label === "Active Members"
                      ? statusCounts.Active
                      : label === "Expired Members"
                        ? statusCounts.Expired
                        : label === "Basic Members"
                          ? statusCounts.Basic
                          : label === "Standard Members"
                            ? statusCounts.Standard
                            : label === "Premium Members"
                              ? statusCounts.Premium
                              : ""
                  }
                  color={
                    label === "Active Members"
                      ? "success"
                      : label === "Expired Members"
                        ? "error"
                        : "primary"
                  }
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
              {label === "Near Expiry" && (
                <Chip
                  label={getExpiringSoonMembers().length}
                  color="warning"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Button>
          ))}
        </Box>

        {/* Add Member Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setNewMember({
                name: "",
                email: "",
                phone: "",
                membershiptype: "",
                startdate: "",
                expirydate: "",
                photo: "",
              });
              setEditId(null);
              setOpen(true);
            }}
          >
            + Add Member
          </Button>
        </Box>

        {/* Search and filter */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "space-between",
            flexWrap: "wrap",
            mb: 3,
            alignItems: "center",
          }}
        >
          <TextField
            label="Search for members..."
            variant="outlined"
            size="medium"
            sx={{ flexGrow: 1, minWidth: 220 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FormControl sx={{ minWidth: 140 }} size="medium">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Expired">Expired</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 140 }} size="medium">
            <InputLabel>Membership</InputLabel>
            <Select
              value={membershipFilter}
              label="Membership"
              onChange={(e) => setMembershipFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Basic">Basic</MenuItem>
              <MenuItem value="Standard">Standard</MenuItem>
              <MenuItem value="Premium">Premium</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Members Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table>
            <TableHead >
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
              {paginatedMembers.map((member) => {
                const daysRemaining = getDaysRemaining(member.expirydate);
                return (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Link to={`/member/${member.id}`} style={{ textDecoration: "none" }}>
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
                    <TableCell>{member.membershiptype}</TableCell>
                    <TableCell>{member.startdate}</TableCell>
                    <TableCell>{member.expirydate}</TableCell>
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
                        label={isExpired(member.expirydate) ? "Expired" : "Active"}
                        color={isExpired(member.expirydate) ? "error" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="warning" onClick={() => handleEdit(member)} size="large" aria-label="edit member">
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(member.id)} size="large" aria-label="delete member">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 2,
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => handleChangePage(page - 1)}
            disabled={page === 1}
          >
            Prev
          </Button>

          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? "contained" : "outlined"}
                onClick={() => handleChangePage(pageNum)}
                size="small"
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outlined"
            onClick={() => handleChangePage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </Box>

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
                    name="membershiptype"
                    value={newMember.membershiptype}
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
                  name="startdate"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newMember.startdate}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Expiry Date"
                  name="expirydate"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newMember.expirydate}
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
                    const expiryDate = new Date(member.expirydate);
                    const today = new Date();
                    const timeDiff = expiryDate.getTime() - today.getTime();
                    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    return (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.expirydate}</TableCell>
                        <TableCell>{member.membershiptype}</TableCell>
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
