"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Skills from "../components/Skills";
import Experience from "../components/Experience";
import Projects from "../components/Projects";
import Education from "../components/Education";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { fetchSkills, fetchExperience, fetchProjects } from "../lib/api";

const FB_SKILLS = [
  { id:"sk1", category:"Languages & Core",   icon:"code",     items:["Python","Java","JavaScript","SQL"] },
  { id:"sk2", category:"AI / ML",            icon:"brain",    items:["Pandas","NumPy","Scikit-Learn","Matplotlib","ML Fundamentals"] },
  { id:"sk3", category:"Backend & Web",      icon:"globe",    items:["FastAPI","Next.js","HTML","CSS","Bootstrap","Tailwind CSS","Streamlit"] },
  { id:"sk4", category:"Databases",          icon:"database", items:["Database Design","OracleDB","SQL Query Optimization","NeonDB"] },
  { id:"sk5", category:"DevOps & Tools",     icon:"tool",     items:["Git","CI/CD","Docker","Jupyter Notebook","Google Colab","Hopsworks","Oracle EBS","Oracle APEX","Form Builder","Report Builder"] },
];
const FB_EXP = {
  experience: [{
    id:"ex1", role:"ERP Intern", company:"US Group — Corporate Head Office",
    duration:"July 2025 – August 2025", type:"Internship",
    points:[
      "Developed and integrated reports and forms using Oracle EBS and Oracle APEX.",
      "Learned and wrote SQL queries, including query design and worked with Oracle SQL databases.",
      "Supported Oracle Forms and Oracle Reports integration and customization to enhance business operations.",
      "Learned and worked on Oracle APEX to develop cross-platform websites and applications.",
    ],
  }],
  education: [{ id:"ed1", degree:"BS Computer Science", institution:"NFC Institute of Engineering & Technology", duration:"2022 – 2026", status:"Final Year", gpa:"3.9 / 4.0 (7th Semester)" }],
  certifications: [
    { id:"ce1", title:"Business Communication & AI for Professionals", issuer:"LUMSx" },
    { id:"ce2", title:"Beginners Meetup — Career Counseling Event",    issuer:"Microsoft Learn Student Ambassador Multan Chapter" },
  ],
};
const FB_PROJECTS = [
  { id:"pr1", title:"AQI Forecasting System",
    description:"A data science application that predicts the average AQI of Multan in category 1–5 for the next 3 days. Five models train daily; system auto-selects the best by F1 Score. Built with a full MLOps pipeline using Hopsworks, deployed on Streamlit Cloud.",
    tags:["Python","Pandas","NumPy","Scikit-Learn","MLOps","Hopsworks","Streamlit","FastAPI"],
    github:"https://github.com/saqibahmadsiddiqui/aqi-forecasting-system", live:"https://multan-aqi.streamlit.app", featured:true },
  { id:"pr2", title:"Personal Portfolio Website",
    description:"A full-stack portfolio built with Next.js 14 and FastAPI with NeonDB. Features smooth animations, dynamic content management via admin dashboard, ZeroBounce email validation, and Nodemailer contact form.",
    tags:["Next.js","FastAPI","TypeScript","Tailwind CSS","NeonDB","Python","Vercel"],
    github:"https://github.com/saqibahmadsiddiqui/portfolio-website", live:"https://saqibahmadsiddiqui.vercel.app", featured:true },
];

export default function Home() {
  const [skills,   setSkills]   = useState(FB_SKILLS);
  const [expData,  setExpData]  = useState(FB_EXP);
  const [projects, setProjects] = useState(FB_PROJECTS);

  useEffect(() => {
    fetchSkills().then(setSkills).catch(()=>{});
    fetchExperience().then(setExpData).catch(()=>{});
    fetchProjects().then(setProjects).catch(()=>{});
  }, []);

  return (
    <main>
      <Navbar />
      <Hero />
      <Skills skills={skills} />
      <Experience experience={expData.experience} />
      <Projects projects={projects} />
      <Education education={expData.education} certifications={expData.certifications} />
      <Contact />
      <Footer />
    </main>
  );
}
