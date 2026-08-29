import { Button } from "./ui/button";
import { ArrowRight, Target, Network, Building2, BarChart3, MessageSquare, Users, Zap, Shield, Headphones } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface AboutProps {
  onNavigate: (path: string) => void;
}

export function About({ onNavigate }: AboutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Navbar onNavigate={onNavigate} currentPath="/about" />

      {/* Main Content */}
      <main className="flex-1">
        {/* Overview Section */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">SCOUP</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              SCOUP (Salisbury University-Industry Connection and Unified Platform) connects students, faculty, and industry to build opportunities for collaboration and innovation.
            </p>
          </div>
        </section>

        {/* Main Features Section - Yellow Background */}
        <section className="bg-[#f5f5dc] py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Breaking down information silos at Salisbury University
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Everything you need to discover expertise, foster partnerships, and enable meaningful collaboration both internally and externally.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* AI-Enhanced Discovery */}
              <div className="bg-white p-8 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-[#8b0000]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Enhanced Discovery</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Find the right faculty expert with confidence-calibrated search results that understand expertise domains and research contexts.
                </p>
              </div>

              {/* Collaboration Networks */}
              <div className="bg-white p-8 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Network className="w-6 h-6 text-[#8b0000]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Collaboration Networks</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Discover internal connections and potential synergies between departments to form cross-disciplinary research teams.
                </p>
              </div>

              {/* Industry Partnerships */}
              <div className="bg-white p-8 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-[#8b0000]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Industry Partnerships</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Connect businesses, nonprofits, and agencies with relevant SU expertise through streamlined contact pathways.
                </p>
              </div>

              {/* Expertise Mapping */}
              <div className="bg-white p-8 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-[#8b0000]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Expertise Mapping</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Visualize knowledge distribution across departments and identify opportunities for interdisciplinary collaboration.
                </p>
              </div>

              {/* Direct Communication */}
              <div className="bg-white p-8 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-[#8b0000]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Direct Communication</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Facilitate meaningful connections with built-in contact management and collaboration request workflows.
                </p>
              </div>

              {/* Team Formation */}
              <div className="bg-white p-8 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#8b0000]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Team Formation</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Automatically suggest optimal team compositions based on complementary expertise and past collaboration success.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Origin / Academic Metrics */}
        <section className="py-14 px-6 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Where SCOUP Came From</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              SCOUP grew out of <strong>Academic Metrics</strong>, a COSC 425 capstone project at Salisbury University
              that built the original research discovery and faculty metrics tooling. That foundation — data
              pipelines, CrossRef integration, and publication tracking — became the backbone of SCOUP v2.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Version 2 rebuilt the entire experience: a React + TypeScript frontend, a Django REST backend,
              AI-powered search, faculty and admin dashboards, collaboration workflows, and a fully managed
              deployment on Render.
            </p>
            <a
              href="https://github.com/Salisbury-University/2024Fall-COSC425-AcademicMetrics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#8b0000] hover:underline"
            >
              View the original Academic Metrics repository →
            </a>
          </div>
        </section>

        {/* CTA Section - White Background */}
        <section className="py-20 px-6 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Empower Your Research & Collaboration
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join the growing network of SU faculty and research staff using SCOUP to discover colleagues, find projects, and foster interdisciplinary collaboration. Break down information silos and connect with the right expertise across the University.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {/* <Button className="bg-[#8b0000] hover:bg-[#700000] text-white px-8 py-6 text-base">
                Learn How It Works
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button> */}
              <Button
                onClick={() => onNavigate("/faculty-signup")}
                className="bg-[#8b0000] hover:bg-[#700000] text-white px-8 py-6 text-base"
              >
                Sign Up
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => onNavigate("/faculty-login")}
                className="bg-[#8b0000] hover:bg-[#700000] text-white px-8 py-6 text-base"
              >
                Already Have Access? Login Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {/* Immediate Discovery */}
              <div>
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-[#8b0000]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Immediate Discovery</h3>
                <p className="text-sm text-gray-600">
                  Start finding faculty expertise and collaboration opportunities across all SU departments immediately.
                </p>
              </div>

              {/* University Integrated */}
              <div>
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#8b0000]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">University Integrated</h3>
                <p className="text-sm text-gray-600">
                  Built specifically for Salisbury University with deep integration into existing systems and workflows.
                </p>
              </div>

              {/* 24/7 Support */}
              <div>
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-[#8b0000]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-sm text-gray-600">
                  Expert support team ready to help you optimize your search experience.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
