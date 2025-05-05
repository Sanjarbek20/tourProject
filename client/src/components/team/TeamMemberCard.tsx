import { type TeamMember } from "@shared/schema";

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard = ({ member }: TeamMemberCardProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md group">
      <div className="relative overflow-hidden">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300"></div>
      </div>
      <div className="p-6 text-center">
        <h3 className="text-xl font-heading font-bold mb-1">{member.name}</h3>
        <p className="text-primary mb-4">{member.position}</p>
        <p className="text-neutral-800/70 mb-4">{member.description}</p>
        <div className="flex justify-center space-x-4">
          <a href="#" className="text-neutral-800/70 hover:text-primary">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="#" className="text-neutral-800/70 hover:text-primary">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="text-neutral-800/70 hover:text-primary">
            <i className="fab fa-facebook"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
