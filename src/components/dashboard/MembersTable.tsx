
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO, differenceInDays } from "date-fns";

interface Member {
  id: string;
  name: string;
  email: string;
  membershipType: string;
  status: string;
  joinDate: string;
  expiryDate: string;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const MembersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    membershipType: "",
    phone: "",
    address: "",
  });
  
  // Fetch membership types for the dropdown
  const { data: membershipTypes } = useQuery({
    queryKey: ['membershipTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_types')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch members data
  const { data: members = [], refetch } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          id,
          profile_id,
          email,
          join_date,
          expiry_date,
          status,
          membership_type_id,
          profiles (full_name),
          membership_types (name)
        `);
      
      if (error) throw error;
      
      return (data || []).map(member => ({
        id: member.id,
        name: member.profiles?.full_name || 'Unknown',
        email: member.email || '',
        membershipType: member.membership_types?.name || 'None',
        status: member.status || 'inactive',
        joinDate: member.join_date || '',
        expiryDate: member.expiry_date || '',
      }));
    }
  });
  
  const handleAddMember = async () => {
    try {
      // First, create a profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{ full_name: newMember.name }])
        .select();
      
      if (profileError) throw profileError;
      
      // Then create the member linked to the profile
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .insert([{
          profile_id: profileData[0].id,
          email: newMember.email,
          membership_type_id: newMember.membershipType,
          phone: newMember.phone,
          address: newMember.address,
          status: 'active'
        }]);
      
      if (memberError) throw memberError;
      
      toast.success("Member added successfully");
      setIsAddDialogOpen(false);
      refetch(); // Refresh the members list
      
      // Reset form
      setNewMember({
        name: "",
        email: "",
        membershipType: "",
        phone: "",
        address: "",
      });
    } catch (error: any) {
      toast.error(`Failed to add member: ${error.message}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember({ ...newMember, [name]: value });
  };

  const handleSelectChange = (value: string) => {
    setNewMember({ ...newMember, membershipType: value });
  };

  // Calculate days remaining for each member
  const calculateDaysRemaining = (expiryDate: string) => {
    if (!expiryDate) return null;
    
    const expiry = parseISO(expiryDate);
    const today = new Date();
    const daysRemaining = differenceInDays(expiry, today);
    
    return daysRemaining >= 0 ? daysRemaining : 0;
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Members</h3>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[250px]"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gym-primary hover:bg-gym-primary/90">
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={newMember.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newMember.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newMember.phone}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={newMember.address}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="membershipType" className="text-right">
                    Membership
                  </Label>
                  <Select 
                    value={newMember.membershipType} 
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select membership type" />
                    </SelectTrigger>
                    <SelectContent>
                      {membershipTypes?.map((type: any) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleAddMember} 
                  className="bg-gym-primary hover:bg-gym-primary/90"
                >
                  Add Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Days Remaining</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.membershipType}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[member.status]}`}>
                    {member.status}
                  </span>
                </TableCell>
                <TableCell>{member.joinDate}</TableCell>
                <TableCell>{member.expiryDate}</TableCell>
                <TableCell>
                  {calculateDaysRemaining(member.expiryDate) !== null ? 
                    `${calculateDaysRemaining(member.expiryDate)} days` : 
                    "N/A"}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MembersTable;
