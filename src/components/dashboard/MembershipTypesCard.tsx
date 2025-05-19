
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ArrowRightIcon } from "lucide-react";

const MembershipTypesCard = () => {
  const membershipTypes = [
    { name: 'Basic', members: 45, color: 'bg-blue-500' },
    { name: 'Standard', members: 32, color: 'bg-green-500' },
    { name: 'Premium', members: 18, color: 'bg-purple-500' },
    { name: 'Annual Basic', members: 12, color: 'bg-amber-500' },
    { name: 'Annual Premium', members: 8, color: 'bg-pink-500' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Membership Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {membershipTypes.map((type) => (
            <div key={type.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                <span className="font-medium text-sm">{type.name}</span>
              </div>
              <div className="text-sm text-gray-600">{type.members} members</div>
            </div>
          ))}

          <div className="pt-2 mt-2 border-t border-gray-200">
            <button className="text-sm font-medium text-gym-primary flex items-center hover:text-gym-primary/80">
              View all memberships 
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MembershipTypesCard;
