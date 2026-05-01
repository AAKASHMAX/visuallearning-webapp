"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Building2 } from "lucide-react";
import api from "@/lib/api";

interface ContactInfo {
  companyName: string;
  address: string;
  phone: string;
  email: string;
}

const defaultContact: ContactInfo = {
  companyName: "VISUALLEARNING AI PRIVATE LIMITED",
  address: "4th floor, Balaji Business center, Pune-Mumbai Highway, National Highway 4, next to hotel Spice Court, Baner, Pune, Maharashtra 411045",
  phone: "9718154204",
  email: "visuallearning247@gmail.com",
};

export default function ContactPage() {
  const [contact, setContact] = useState<ContactInfo>(defaultContact);

  useEffect(() => {
    api.get("/admin/public-settings").then(({ data }) => {
      if (data.data?.contactInfo) {
        setContact({ ...defaultContact, ...data.data.contactInfo });
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-gray-500 mb-8">We&apos;d love to hear from you. Reach out with any questions or feedback.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Company</h3>
                    <p className="text-gray-600">{contact.companyName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Address</h3>
                    <p className="text-gray-600">{contact.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Phone</h3>
                    <a href={`tel:+91${contact.phone}`} className="text-primary hover:underline">
                      +91 {contact.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email</h3>
                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                      {contact.email}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
              <p className="text-gray-600 mb-4">
                For subscription queries, technical support, or any other inquiries, feel free to reach out via email or phone.
                We typically respond within 24 hours.
              </p>
              <a
                href={`mailto:${contact.email}`}
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Send us an Email
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
