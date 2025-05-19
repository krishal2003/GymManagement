
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gym-secondary to-gym-dark text-white py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Simplified Gym Management
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Streamline your operations, enhance member experience, and grow your fitness business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-gym-primary hover:bg-gym-primary/90 text-white">
                <Link to="/contact">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Powerful Features for Your Gym
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105">
                <div className="h-14 w-14 rounded-full bg-gym-primary/20 flex items-center justify-center mb-4 mx-auto">
                  {/* You can keep the original SVG or replace */}
                  <svg className="w-8 h-8 text-gym-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">Member Management</h3>
                <p className="text-gray-600 text-center">
                  Easily manage memberships, track attendance, and handle billing in one place.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105">
                <div className="h-14 w-14 rounded-full bg-gym-primary/20 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-gym-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {/* Bell icon for reminder */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">Expiry Date Alerts</h3>
                <p className="text-gray-600 text-center">
                  Get notified 7 days before membership expiry to stay ahead.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-105">
                <div className="h-14 w-14 rounded-full bg-gym-primary/20 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-gym-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {/* Note icon */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8h5a2 2 0 002-2v-5l-6-6H7a2 2 0 00-2 2v9a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">Add  Notes</h3>
                <p className="text-gray-600 text-center">
                  Attach notes on payments or other member details for easy tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gym-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Gym Management?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of gym owners who've simplified their operations with FitTrack.
            </p>
            <Button asChild size="lg" className="bg-white text-gym-primary hover:bg-gray-100">
              <Link to="/login">Get Started Today</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
