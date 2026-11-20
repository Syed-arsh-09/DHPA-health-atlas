import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  MapPin, 
  Github, 
  BookOpen, 
  Users, 
  Sparkles,
  MessageSquare,
  Building2
} from 'lucide-react';

export default function ContactUs() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Student / Researcher',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setFormSubmitted(true);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Connect & Collaborate</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Contact the DHPA India Team
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Have questions about district healthcare profiling, policy implementation, or data collaboration? Reach out to our project team.
          </p>
        </div>
      </section>

      {/* Grid: Contact Cards & Interactive Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Contact Info Cards */}
        <div className="space-y-4 lg:col-span-1">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Academic Project</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Semester 5 • INT-396 Public Health Analytics
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Email Inquiries</h3>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                arsh@dhpa-india.org
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Research and public health collaboration
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Code & Repository</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Open-source public health analytics and React atlas on GitHub.
              </p>
            </div>
          </div>

        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          {formSubmitted ? (
            <div className="py-12 text-center space-y-3 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Message Received!</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Thank you for reaching out to the DHPA India project. Our team will review your message and get back to you shortly.
              </p>
              <button
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({ name: '', email: '', role: 'Student / Researcher', subject: '', message: '' });
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Send Us a Message
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fill in the details below and we will get back to you
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@organization.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Your Role / Field</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Student / Researcher">Student / Academic Researcher</option>
                    <option value="Healthcare Professional">Healthcare Worker / Doctor</option>
                    <option value="Policymaker / Public Health">Public Health Administrator</option>
                    <option value="NGO / Development Sector">NGO / Social Sector</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Subject</label>
                  <input
                    type="text"
                    placeholder="Project inquiry or feedback"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we assist you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
