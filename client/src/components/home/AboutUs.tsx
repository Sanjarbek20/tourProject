import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { type TeamMember } from "@shared/schema";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import { Skeleton } from "@/components/ui/skeleton";

const AboutUs = () => {
  const { t } = useTranslation();
  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team'],
  });

  // Create placeholder items for loading state
  const teamPlaceholders = Array(4).fill(0).map((_, index) => (
    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
      <Skeleton className="h-64 w-full" />
      <div className="p-6 text-center">
        <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
        <Skeleton className="h-4 w-1/3 mx-auto mb-4" />
        <Skeleton className="h-20 w-full mb-4" />
        <div className="flex justify-center space-x-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </div>
  ));

  return (
    <section id="about" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-heading font-bold text-neutral-800 mb-6">
              {t("about.title")}
            </h2>
            <p className="text-lg text-neutral-800/70 mb-6">
              {t("about.description1")}
            </p>
            <p className="text-lg text-neutral-800/70 mb-6">
              {t("about.description2")}
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-users text-xl text-primary"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {t("about.stats.travelers.count")}
                  </div>
                  <div className="text-neutral-800/70">
                    {t("about.stats.travelers.label")}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-map-marked-alt text-xl text-primary"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {t("about.stats.destinations.count")}
                  </div>
                  <div className="text-neutral-800/70">
                    {t("about.stats.destinations.label")}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-award text-xl text-primary"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {t("about.stats.experience.count")}
                  </div>
                  <div className="text-neutral-800/70">
                    {t("about.stats.experience.label")}
                  </div>
                </div>
              </div>
            </div>
            <a
              href="#"
              className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-heading font-medium transition-colors duration-200"
            >
              {t("about.learnMore")}
            </a>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1601379217147-9c5e804b8e76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
              alt="About Dildora Tours"
              className="w-full h-auto rounded-lg shadow-xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg max-w-xs hidden md:block">
              <div className="flex items-center">
                <div className="flex text-[#FF9800]">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <div className="ml-2 font-bold">5.0/5</div>
              </div>
              <p className="mt-2 text-neutral-800/70">
                "The best tour company in Uzbekistan. Our guide was knowledgeable and the experiences were unforgettable!"
              </p>
              <div className="mt-3 font-medium">- Sarah J., United States</div>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-neutral-800 mb-4">
              {t("about.team.title")}
            </h2>
            <p className="text-lg text-neutral-800/70 max-w-2xl mx-auto">
              {t("about.team.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading
              ? teamPlaceholders
              : teamMembers?.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
