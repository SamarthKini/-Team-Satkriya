import {
  Heart,
  Users,
  ShoppingBag,
  ShieldCheck,
  FileCheck,
  MessagesSquare,
  Search,
  CalendarCheck,
  Languages,
  Video,
  UserSearch,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard/FeatureCard";
import breeds from "@/constants/breeds";
import BreedCard from "@/components/BreedCard/BreedCard";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { useEffect } from "react";

function Home() {
  const navigate = useNavigate();
  const {setNav}=useAuthContext();

  useEffect(()=>{
    setNav(true);
  },[])

  return (
    <div className="min-h-screen bg-background">
     

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1598715559054-0dd66c7e811c?auto=format&fit=crop&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 relative z-10 text-white text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Preserving India's Heritage
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Join us in our mission to protect and revive indigenous cow breeds
            through sustainable practices and modern technology
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 cursor-pointer">
              <Users className="mr-2 h-5 w-5" /> Connect with Experts
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm cursor-pointer"
            >
              <Heart className="mr-2 h-5 w-5" /> Adopt a Cow
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      {/* <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {impactMetrics.map((metric, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-primary mb-2">
                    {metric.value}
                  </p>
                  <p className="text-muted-foreground">{metric.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Main Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={ShieldCheck}
              title="Secured User Authentication"
              description="Safe login for different users"
            />
            <FeatureCard
              icon={FileCheck}
              title="AI-Filtered Posts & Verification"
              description="Verified posts for accurate information"
            />
            <FeatureCard
              icon={MessagesSquare}
              title="Categorized Comment System"
              description="Organized comments by user type"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <FeatureCard
              icon={ShoppingBag}
              title="Marketing through posts"
              description="Buy and sell organic cow products from verified sellers"
            />
            <FeatureCard
              icon={Video}
              title="AI-Verified Webinar Platform"
              description="Verified webinars for relevant knowledge"
            />
            <FeatureCard
              icon={Search}
              title="AI-Powered Query Search"
              description="Smart search for farmer queries."
            />
          </div>
        </div>
      </section>
      
      {/* Main Future Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Future Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={CalendarCheck}
              title="Webinar Registration & Management"
              description="Manage and register for webinars"
            />
            <FeatureCard
              icon={CalendarCheck}
              title="AI-Generated Expert Queries"
              description="AI posts unanswered farmer queries"
            />
            <FeatureCard
              icon={Users}
              title="Finding Volunteers & Helpers"
              description="Locate nearby farming volunteers easily"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <FeatureCard
              icon={UserSearch}
              title="AI-Based Expert Suggestions"
              description="Smart matching with nearby experts"
            />
            <FeatureCard
              icon={ShoppingCart}
              title="Online Marketplace for Farmers"
              description="Buy and sell cow-related products"
            />
            <FeatureCard
              icon={Languages}
              title="Google Translation"
              description="Google translation assistance"
            />
          </div>
        </div>
      </section>

      {/* Indigenous Breeds Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Indigenous Breeds</h2>
            <p className="text-xl text-muted-foreground">
              Discover India's precious cow breeds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {breeds.map((breed, index) => (
              <BreedCard key={index} {...breed}  />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of farmers, experts, and supporters in preserving
            India's indigenous cow breeds
          </p>
          <Button
            size="lg"
            onClick={() => {
              navigate("/farmer/register");
            }}
            variant="secondary"
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
}

export default Home;
