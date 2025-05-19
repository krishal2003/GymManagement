
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Box, Grid } from "@mui/material";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gym-secondary to-gym-dark text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About FitTrack</h1>
            <p className="text-xl max-w-3xl mx-auto">
              We're on a mission to simplify gym management and help fitness businesses thrive.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gym-secondary">Our Story</h2>
                <p className="text-gray-700 mb-4">
                  Founded in 2025 by Mavenest Group, FitTrack was created with a clear purpose: to help gym owners and managers who were spending too much time on administrative tasks and not enough time engaging with their members or growing their business.




                </p>
                <p className="text-gray-700 mb-4">
                  Our team is made up of young IT enthusiasts and fitness lovers who share a passion for simplifying gym management through technology.                </p>
                <p className="text-gray-700">
                  Currently, FitTrack is proudly operating in more than 5 gyms across Nepal, empowering fitness facilities to streamline their operations, save time, and focus on delivering great member experiences.
                </p>
              </div>
              <div className="bg-gray-200 h-80 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gym-primary/30 to-gym-accent/30 flex items-center justify-center">
                  <p className="text-lg font-medium text-gym-secondary">Company Image</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission & Values */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-gym-secondary">Our Mission & Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-14 w-14 rounded-full bg-gym-primary/20 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-gym-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">Innovation</h3>
                <p className="text-gray-600 text-center">
                  We constantly push boundaries to create tools that anticipate and solve the evolving challenges of fitness businesses.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-14 w-14 rounded-full bg-gym-primary/20 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-gym-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">Customer Focus</h3>
                <p className="text-gray-600 text-center">
                  We build genuine relationships with our clients, listening to their needs and supporting their growth.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-14 w-14 rounded-full bg-gym-primary/20 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-gym-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">Reliability</h3>
                <p className="text-gray-600 text-center">
                  We build products that our customers can depend on, day in and day out, to run their businesses effectively.
                </p>
              </div>
            </div>
          </div>
        </section>
        < Box sx={{
          // gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          flexDirection: 'row',
          mb: 5,
          p: 2
        }}>

          {/* Team Section */}
          <h2 className="text-3xl font-bold mb-12 text-center text-gym-secondary">Our Leadership Team</h2>
          {/* Team Member 1 */}
          <div className="text-center">
            <div className="w-40 h-40 mx-auto bg-gray-300 rounded-full mb-4 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gym-primary/20 to-gym-accent/20 flex items-center justify-center">
                <p className="text-sm font-medium text-gym-secondary">Photo</p>
              </div>
            </div>
            <h3 className="text-xl font-semibold">Krishal Basnet</h3>
            <p className="text-gym-primary">Founder</p>
          </div>

          {/* Team Member 2 */}
          <div className="text-center">
            <div className="w-40 h-40 mx-auto bg-gray-300 rounded-full mb-4 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gym-primary/20 to-gym-accent/20 flex items-center justify-center">
                <p className="text-sm font-medium text-gym-secondary">Photo</p>
              </div>
            </div>
            <h3 className="text-xl font-semibold">Aayush Sharma</h3>
            <p className="text-gym-primary">Co-Founder</p>
          </div>

          {/* Team Member 3 */}
          <div className="text-center">
            <div className="w-40 h-40 mx-auto bg-gray-300 rounded-full mb-4 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gym-primary/20 to-gym-accent/20 flex items-center justify-center">
                <p className="text-sm font-medium text-gym-secondary">Photo</p>
              </div>
            </div>
            <h3 className="text-xl font-semibold"> Utkarsh Khadka</h3>
            <p className="text-gym-primary">Co-Founder</p>
          </div>


        </Box>

      </main>
      <Footer />
    </div>
  );
};

export default About;
