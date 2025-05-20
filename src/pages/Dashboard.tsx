"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  ArrowUpDown,
  Edit,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  BarChart3,
} from "lucide-react"

import { supabase } from "../lib/supabaseClient"
import { Link } from "react-router-dom"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Box } from "@mui/material"
import { Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js"

ChartJS.register(ArcElement, ChartTooltip, Legend)

export default function Dashboard() {
  // States
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Filters and UI states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [membershipFilter, setMembershipFilter] = useState("All Memberships")
  const [activeTab, setActiveTab] = useState("overview")

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)

  // Add/Edit Member Dialog
  const [openDialog, setOpenDialog] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    membershiptype: "",
    startdate: "",
    expirydate: "",
    photo: "",
  })

  // Near Expiry Dialog
  const [nearExpiryOpen, setNearExpiryOpen] = useState(false)

  // Pagination for members table
  const [page, setPage] = useState(1)
  const itemsPerPage = 15

  // Recent Activities dynamic state
  const [recentActivities, setRecentActivities] = useState<
    { id: number; type: "add" | "edit" | "delete"; member: string; time: string }[]
  >([])

  // Utility functions
  const isExpired = (expirydate: string) => new Date(expirydate) < new Date()

  const getDaysRemaining = (expirydate: string) => {
    const today = new Date()
    const expiry = new Date(expirydate)
    const diffTime = expiry.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 3600 * 24))
  }

  const getExpiringSoonMembers = () => {
    const now = new Date()
    const sevenDaysLater = new Date()
    sevenDaysLater.setDate(now.getDate() + 7)

    return members.filter((member) => {
      const expiry = new Date(member.expirydate)
      return expiry >= now && expiry <= sevenDaysLater
    })
  }

  // Data Fetch
  async function fetchMembers() {
    setLoading(true)
    const { data, error } = await supabase.from("members").select("*")
    if (error) {
      console.error("Failed to load members:", error.message)
      toast({ title: "Error", description: "Failed to load members from database.", variant: "destructive" })
    } else {
      setMembers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  // Add activity helper
  function addActivity(type: "add" | "edit" | "delete", member: string) {
    setRecentActivities((prev) => {
      const newActivity = {
        id: Date.now(),
        type,
        member,
        time: "Just now",
      }
      const updated = [newActivity, ...prev]
      return updated.slice(0, 5) // Keep only latest 5
    })
  }

  // Handlers for Add/Edit Member Form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewMember((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddOrUpdateMember = async () => {
    if (!newMember.name || !newMember.email) {
      toast({ title: "Validation Error", description: "Name and Email are required." })
      return
    }

    if (editId) {
      const { error } = await supabase.from("members").update(newMember).eq("id", editId)
      if (error) {
        toast({ title: "Error", description: "Failed to update member.", variant: "destructive" })
        return
      }
      toast({ title: "Success", description: "Member updated successfully." })
      addActivity("edit", newMember.name)
    } else {
      const { error } = await supabase.from("members").insert([newMember])
      if (error) {
        toast({ title: "Error", description: "Failed to add member.", variant: "destructive" })
        return
      }
      toast({ title: "Success", description: "New member added successfully." })
      addActivity("add", newMember.name)
    }

    setOpenDialog(false)
    setEditId(null)
    setNewMember({
      name: "",
      email: "",
      phone: "",
      membershiptype: "",
      startdate: "",
      expirydate: "",
      photo: "",
    })

    fetchMembers()
  }

  // Edit Button Handler
  const handleEdit = (member: any) => {
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone,
      membershiptype: member.membershiptype,
      startdate: member.startdate,
      expirydate: member.expirydate,
      photo: member.photo || "",
    })
    setEditId(member.id)
    setOpenDialog(true)
  }

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return

    const memberName = members.find((m) => m.id === id)?.name || "Member"

    const { error } = await supabase.from("members").delete().eq("id", id)
    if (error) {
      toast({ title: "Error", description: "Failed to delete member.", variant: "destructive" })
      return
    }
    toast({ title: "Deleted", description: "Member deleted successfully.", variant: "default" })
    addActivity("delete", memberName)

    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  // Filtering logic
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "All Statuses" ||
      member.status === statusFilter ||
      (statusFilter === "Expired" && isExpired(member.expirydate)) ||
      (statusFilter === "Active" && !isExpired(member.expirydate))

    const matchesMembership =
      membershipFilter === "All Memberships" || member.membershiptype === membershipFilter

    return matchesSearch && matchesStatus && matchesMembership
  })

  // Sorting logic with memoization
  const sortedMembers = (() => {
    if (!sortConfig) return filteredMembers

    const sorted = [...filteredMembers].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      if (sortConfig.key === "name") {
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
      } else if (sortConfig.key === "daysLeft") {
        aValue = isExpired(a.expirydate) ? -1 : getDaysRemaining(a.expirydate)
        bValue = isExpired(b.expirydate) ? -1 : getDaysRemaining(b.expirydate)
      } else {
        return 0
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })

    return sorted
  })()

  // Pagination logic for members table
  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage)
  const paginatedMembers = sortedMembers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  // Statistics
  const totalMembersCount = members.length
  const activeMembersCount = members.filter((m) => !isExpired(m.expirydate)).length
  const expiredMembersCount = members.filter((m) => isExpired(m.expirydate)).length
  const basicMembersCount = members.filter((m) => m.membershiptype === "Basic").length
  const standardMembersCount = members.filter((m) => m.membershiptype === "Standard").length
  const premiumMembersCount = members.filter((m) => m.membershiptype === "Premium").length
  const nearExpiryCount = members.filter(
    (m) => !isExpired(m.expirydate) && getDaysRemaining(m.expirydate) <= 7
  ).length

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  // Sorting header click handler
  const handleSort = (key: string) => {
    if (sortConfig && sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      })
    } else {
      setSortConfig({ key, direction: "asc" })
    }
  }

  // Pie Chart data and options
  const pieData = {
    labels: ["Basic", "Standard", "Premium"],
    datasets: [
      {
        label: "Membership Distribution",
        data: [basicMembersCount, standardMembersCount, premiumMembersCount],
        backgroundColor: ["#3b82f6", "#8b5cf6", "#f59e0b"], // blue, purple, amber
        borderColor: ["#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: { size: 14 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || ""
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percent = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percent}%)`
          },
        },
      },
    },
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Navbar />

        <main className="container mx-auto px-4 py-6">
          {/* Welcome Banner */}
          <div className="mb-8 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
            <div className="px-6 py-5 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl font-bold text-white sm:text-2xl">Welcome back, Admin!</h2>
                <p className="mt-1 text-blue-100">
                  Today is {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    setEditId(null)
                    setNewMember({
                      name: "",
                      email: "",
                      phone: "",
                      membershiptype: "",
                      startdate: "",
                      expirydate: "",
                      photo: "",
                    })
                    setOpenDialog(true)
                  }}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 lg:w-auto">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Members</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              {/* Stats Cards */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="overflow-hidden relative">
                  <div className="absolute right-0 top-0 h-16 w-16 translate-x-6 -translate-y-6 transform rounded-full bg-blue-500/20" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-blue-600" />
                      <div className="text-2xl font-bold">{totalMembersCount}</div>
                    </div>
                    <p className="mt-2 text-xs text-green-600">
                      <span className="font-medium">+12%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden relative">
                  <div className="absolute right-0 top-0 h-16 w-16 translate-x-6 -translate-y-6 transform rounded-full bg-green-500/20" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                      <div className="text-2xl font-bold">{activeMembersCount}</div>
                    </div>
                    <div className="mt-2">
                      <Progress value={(activeMembersCount / totalMembersCount) * 100} className="h-1" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {Math.round((activeMembersCount / totalMembersCount) * 100)}% of total
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden relative cursor-pointer" onClick={() => setNearExpiryOpen(true)}>
                  <div className="absolute right-0 top-0 h-16 w-16 translate-x-6 -translate-y-6 transform rounded-full bg-amber-500/20" />
                  <CardHeader className="pb-2">
                    <CardTitle>Near Expiry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-amber-600" />
                      <div className="text-2xl font-bold">{nearExpiryCount}</div>
                    </div>
                    <p className="mt-2 text-xs text-amber-600">
                      <span className="font-medium">Action needed</span> within 7 days
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Membership Distribution & Recent Activity */}
              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Membership Distribution with Pie Chart */}
                <Card className="col-span-1 lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Membership Distribution</CardTitle>
                    <CardDescription>Breakdown of current membership types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-w-md mx-auto">
                      <Pie data={pieData} options={pieOptions} />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest gym activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 mb-4">
                          <div
                            className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${activity.type === "add"
                                ? "bg-green-100 text-green-600"
                                : activity.type === "edit"
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                          >
                            {activity.type === "add" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : activity.type === "edit" ? (
                              <Edit className="h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {activity.type === "add"
                                ? `${activity.member} added`
                                : activity.type === "edit"
                                  ? `${activity.member} updated`
                                  : `${activity.member} deleted`}
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent activities.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="mt-6">
              {/* Quick Actions */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <Button
                  onClick={() => {
                    setEditId(null)
                    setNewMember({
                      name: "",
                      email: "",
                      phone: "",
                      membershiptype: "",
                      startdate: "",
                      expirydate: "",
                      photo: "",
                    })
                    setOpenDialog(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" /> ADD MEMBER
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search for members..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Statuses">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Membership" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Memberships">All Memberships</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Members Table */}
              <Card className="overflow-hidden border-none shadow-md">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <TableHead>Photo</TableHead>
                        <TableHead>
                          <div
                            className="flex items-center cursor-pointer select-none"
                            onClick={() => handleSort("name")}
                          >
                            Name
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                            {sortConfig?.key === "name" && (
                              <span className="ml-1 text-xs">
                                {sortConfig.direction === "asc" ? "▲" : "▼"}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Membership Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>
                          <div
                            className="flex items-center cursor-pointer select-none"
                            onClick={() => handleSort("daysLeft")}
                          >
                            Days Left
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                            {sortConfig?.key === "daysLeft" && (
                              <span className="ml-1 text-xs">
                                {sortConfig.direction === "asc" ? "▲" : "▼"}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedMembers.length > 0 ? (
                        paginatedMembers.map((member) => (
                          <TableRow
                            key={member.id}
                            className="group transition-colors hover:bg-blue-50/50"
                          >
                            <TableCell>
                              <Link to={`/member/${member.id}`} className="block">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm transition-transform group-hover:scale-110 cursor-pointer">
                                  <AvatarImage
                                    src={member.photo || "/placeholder.svg"}
                                    alt={member.name}
                                  />
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </Link>
                            </TableCell>
                            <TableCell className="font-medium">
                              <Link
                                to={`/member/${member.id}`}
                                className="hover:underline cursor-pointer"
                              >
                                {member.name}
                              </Link>
                            </TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>{member.phone}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`${member.membershiptype === "Premium"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : member.membershiptype === "Standard"
                                      ? "border-purple-200 bg-purple-50 text-purple-700"
                                      : "border-blue-200 bg-blue-50 text-blue-700"
                                  }`}
                              >
                                {member.membershiptype}
                              </Badge>
                            </TableCell>
                            <TableCell>{member.startdate}</TableCell>
                            <TableCell>{member.expirydate}</TableCell>
                            <TableCell>
                              {isExpired(member.expirydate) ? (
                                "—"
                              ) : (
                                <span
                                  className={`${getDaysRemaining(member.expirydate) <= 7
                                      ? "font-medium text-red-500"
                                      : ""
                                    }`}
                                >
                                  {getDaysRemaining(member.expirydate)}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${isExpired(member.expirydate) ? "bg-red-600" : "bg-green-600"
                                  }`}
                              >
                                {isExpired(member.expirydate) ? "Expired" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        onClick={() => handleEdit(member)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-amber-500 opacity-70 transition-opacity hover:opacity-100"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit Member</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        onClick={() => handleDelete(member.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 opacity-70 transition-opacity hover:opacity-100"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete Member</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Users className="h-8 w-8 text-gray-300" />
                              <p className="mt-2 text-muted-foreground">No members found.</p>
                              <Button
                                onClick={() => {
                                  setEditId(null)
                                  setNewMember({
                                    name: "",
                                    email: "",
                                    phone: "",
                                    membershiptype: "",
                                    startdate: "",
                                    expirydate: "",
                                    photo: "",
                                  })
                                  setOpenDialog(true)
                                }}
                                variant="outline"
                                className="mt-4"
                              >
                                <Plus className="mr-2 h-4 w-4" /> Add New Member
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Prev
                  </Button>
                  {[...Array(totalPages)].map((_, idx) => {
                    const p = idx + 1
                    return (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        onClick={() => handlePageChange(p)}
                        size="sm"
                      >
                        {p}
                      </Button>
                    )
                  })}
                  <Box sx={{ mb: 4 }}>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </Box>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add/Edit Member Dialog */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editId ? "Edit Member" : "Add New Member"}</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newMember.name}
                    onChange={handleInputChange}
                    placeholder="John Doe" />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newMember.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com" />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newMember.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210" />
                </div>

                <div>
                  <Label htmlFor="photo">Photo URL</Label>
                  <Input
                    id="photo"
                    name="photo"
                    value={newMember.photo}
                    onChange={handleInputChange}
                    placeholder="https://example.com/photo.jpg" />
                </div>

                <div>
                  <Label htmlFor="membershiptype">Membership Type</Label>
                  <Select
                    value={newMember.membershiptype}
                    onValueChange={(val) => setNewMember((prev) => ({ ...prev, membershiptype: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select membership type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startdate">Start Date</Label>
                  <Input
                    id="startdate"
                    name="startdate"
                    type="date"
                    value={newMember.startdate}
                    onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="expirydate">Expiry Date</Label>
                  <Input
                    id="expirydate"
                    name="expirydate"
                    type="date"
                    value={newMember.expirydate}
                    onChange={handleInputChange} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddOrUpdateMember} className="bg-blue-600 hover:bg-blue-700">
                  {editId ? "Update Member" : "Add Member"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Near Expiry Dialog */}
          <Dialog open={nearExpiryOpen} onOpenChange={setNearExpiryOpen}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Members Expiring Within 7 Days</DialogTitle>
              </DialogHeader>

              <div className="overflow-x-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Membership Type</TableHead>
                      <TableHead>Days Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getExpiringSoonMembers().length > 0 ? (
                      getExpiringSoonMembers().map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.expirydate}</TableCell>
                          <TableCell>{member.membershiptype}</TableCell>
                          <TableCell>
                            <span className="font-medium text-red-600">
                              {getDaysRemaining(member.expirydate)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">
                          No members expiring within the next 7 days.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setNearExpiryOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
      <Footer />
    </>
  )
}
