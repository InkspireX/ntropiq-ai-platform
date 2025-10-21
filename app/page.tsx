"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function LandingPage() {
  useEffect(() => {
    // Smooth scrolling for navigation links
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.getAttribute("href")?.startsWith("#")) {
        e.preventDefault()
        const element = document.querySelector(target.getAttribute("href")!)
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      }
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement
          element.style.opacity = "1"
          element.style.transform = "translateY(0)"
        }
      })
    }, observerOptions)

    // Add event listeners
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", handleSmoothScroll)
    })

    // Observe tier cards and API cards
    document.querySelectorAll(".tier-card").forEach((card, index) => {
      const element = card as HTMLElement
      element.style.opacity = "0"
      element.style.transform = "translateY(20px)"
      element.style.transition = `all 0.5s ease ${index * 0.1}s`
      observer.observe(element)
    })

    document.querySelectorAll(".api-card").forEach((card, index) => {
      const element = card as HTMLElement
      element.style.opacity = "0"
      element.style.transform = "translateY(20px)"
      element.style.transition = `all 0.5s ease ${index * 0.1}s`
      observer.observe(element)
    })

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.removeEventListener("click", handleSmoothScroll)
      })
      observer.disconnect()
    }
  }, [])

  return (
    <div className="font-sans bg-[#fafafa] text-[#1a1a1a] leading-relaxed overflow-x-hidden">
      {/* Header */}
      <header className="bg-[#fafafa] py-4 border-b border-[#e5e5e5] sticky top-0 z-[1000]">
        <div className="max-w-6xl mx-auto px-8">
          <nav className="flex justify-between items-center">
            <a href="#" className="flex items-center gap-3 no-underline">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-uuY7YmId8tYIqbTx5mQN3jHsVvVQtk.webp"
                alt="ntropiq logo"
                width="32"
                height="32"
                className="object-contain"
              />
              <span className="text-2xl font-semibold text-[#1a1a1a]">ntropiq</span>
            </a>
            <ul className="hidden md:flex gap-8 list-none">
              <li>
                <a
                  href="#platform"
                  className="text-[#666] no-underline font-medium hover:text-[#1a1a1a] transition-colors duration-200"
                >
                  Platform
                </a>
              </li>
              <li>
                <a
                  href="#api"
                  className="text-[#666] no-underline font-medium hover:text-[#1a1a1a] transition-colors duration-200"
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="#docs"
                  className="text-[#666] no-underline font-medium hover:text-[#1a1a1a] transition-colors duration-200"
                >
                  Docs
                </a>
              </li>
              <li>
                <a
                  href="#enterprise"
                  className="text-[#666] no-underline font-medium hover:text-[#1a1a1a] transition-colors duration-200"
                >
                  Enterprise
                </a>
              </li>
              <li>
                <Link
                  href="/chat"
                  className="text-[#666] no-underline font-medium hover:text-[#1a1a1a] transition-colors duration-200"
                >
                  AI Chat
                </Link>
              </li>
              <li>
                <Link
                  href="/notebook"
                  className="text-[#666] no-underline font-medium hover:text-[#1a1a1a] transition-colors duration-200"
                >
                  Notebook
                </Link>
              </li>
            </ul>
            <div className="flex gap-3">
              <Link
                href="/notebook"
                className="bg-transparent text-[#666] px-5 py-2.5 border border-[#e5e5e5] rounded-md font-medium no-underline transition-all duration-200 text-sm hover:border-[#ccc] hover:text-[#333]"
              >
                Try Notebook
              </Link>
              <Link
                href="/chat"
                className="bg-transparent text-[#666] px-5 py-2.5 border border-[#e5e5e5] rounded-md font-medium no-underline transition-all duration-200 text-sm hover:border-[#ccc] hover:text-[#333]"
              >
                Try AI Chat
              </Link>
              <Link
                href="/signin"
                className="bg-[#1a1a1a] text-white px-5 py-2.5 border-none rounded-md font-medium no-underline transition-all duration-200 text-sm hover:bg-[#333]"
              >
                Start Building
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 pb-24 text-center">
        <div className="max-w-6xl mx-auto px-8">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6 text-[#1a1a1a] tracking-tight">
            Query your data, build ML models with natural language
          </h1>
          <h2 className="text-lg md:text-xl font-normal text-[#666] mb-2 leading-relaxed">
            Get the highest quality analytics insights and machine learning models from natural language queries
          </h2>
          <h3 className="text-base md:text-lg font-normal text-[#999] mb-12 leading-relaxed">
            A unified analytics and ML platform built with, by, and for data teams and business users
          </h3>
          <div className="flex gap-4 justify-center mb-16 flex-wrap">
            <Link
              href="/notebook"
              className="bg-[#1a1a1a] text-white px-6 py-3 border-none rounded-md font-medium no-underline transition-all duration-200 text-base hover:bg-[#333]"
            >
              Try Notebook Now
            </Link>
            <Link
              href="/chat"
              className="bg-transparent text-[#666] px-6 py-3 border border-[#e5e5e5] rounded-md font-medium no-underline transition-all duration-200 text-base hover:border-[#ccc] hover:text-[#333]"
            >
              Try AI Chat
            </Link>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-[#f5f5f5] py-8 mb-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="text-base font-semibold text-[#1a1a1a] mb-2">Conversational</h4>
              <p className="text-sm text-[#666] leading-relaxed">
                Ask questions in natural language, get instant analytics insights and ML models back.
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-[#1a1a1a] mb-2">Intelligent</h4>
              <p className="text-sm text-[#666] leading-relaxed">
                From business dashboards to predictive models. Automatically choose the right approach.
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-[#1a1a1a] mb-2">Enterprise-Ready</h4>
              <p className="text-sm text-[#666] leading-relaxed">
                SOC-II Type 2 Certified, secure data processing, trusted by Fortune 500 analytics teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-24" id="platform">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-4xl font-semibold text-center mb-4 text-[#1a1a1a] tracking-tight">
            Highest quality from simple queries to complex models
          </h2>
          <p className="text-center text-lg text-[#666] mb-16 max-w-2xl mx-auto">
            State of the art across business analytics, predictive modeling, and advanced machine learning
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="tier-card bg-white border border-[#e5e5e5] rounded-lg p-8 transition-all duration-200 hover:border-[#ccc] hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-2 text-[#1a1a1a]">Natural Language Analytics</h3>
              <div className="text-[#999] mb-4 text-sm">For business teams and analysts</div>
              <p className="text-[#666] mb-6 leading-relaxed">
                Ask questions about your data in plain English and get instant insights, visualizations, and interactive
                dashboards.
              </p>
              <ul className="list-none">
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Conversational data exploration and querying
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Automated visualization and chart generation
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Interactive dashboard creation from text prompts
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Business intelligence report automation
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Real-time data monitoring and alerting
                </li>
              </ul>
            </div>

            <div className="tier-card bg-white border border-[#e5e5e5] rounded-lg p-8 transition-all duration-200 hover:border-[#ccc] hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-2 text-[#1a1a1a]">Predictive Model Building</h3>
              <div className="text-[#999] mb-4 text-sm">For data scientists and ML practitioners</div>
              <p className="text-[#666] mb-6 leading-relaxed">
                Build and deploy sophisticated machine learning models through natural language instructions with
                automated optimization.
              </p>
              <ul className="list-none">
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Natural language to ML model generation
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Automated feature engineering and selection
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Multi-algorithm model comparison and optimization
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Model explanation and interpretability tools
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  One-click model deployment and serving
                </li>
              </ul>
            </div>

            <div className="tier-card bg-white border border-[#e5e5e5] rounded-lg p-8 transition-all duration-200 hover:border-[#ccc] hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-2 text-[#1a1a1a]">Data Integration & Preparation</h3>
              <div className="text-[#999] mb-4 text-sm">For data engineers and analysts</div>
              <p className="text-[#666] mb-6 leading-relaxed">
                Seamlessly connect, clean, and prepare data from any source through intelligent automation and natural
                language commands.
              </p>
              <ul className="list-none">
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Universal data connectors (Snowflake, BigQuery, APIs)
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Automated data quality assessment and cleaning
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Natural language data transformation pipelines
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Real-time data synchronization and monitoring
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Automated schema mapping and data lineage
                </li>
              </ul>
            </div>

            <div className="tier-card bg-white border border-[#e5e5e5] rounded-lg p-8 transition-all duration-200 hover:border-[#ccc] hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-2 text-[#1a1a1a]">Advanced Analytics Engine</h3>
              <div className="text-[#999] mb-4 text-sm">For complex analytical workflows</div>
              <p className="text-[#666] mb-6 leading-relaxed">
                Sophisticated statistical analysis, time series forecasting, and custom ML pipelines through intelligent
                automation.
              </p>
              <ul className="list-none">
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Advanced statistical analysis and hypothesis testing
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Time series forecasting and anomaly detection
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Custom ML pipeline creation and orchestration
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Multi-modal data analysis (text, images, numerical)
                </li>
                <li className="text-[#666] mb-1.5 relative pl-5 text-sm before:content-['•'] before:absolute before:left-0 before:text-[#999]">
                  Automated A/B testing and causal inference
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-24 bg-white" id="api">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-4xl font-semibold text-center mb-4 text-[#1a1a1a] tracking-tight">
            The analytics and ML platform, organized for every team
          </h2>
          <p className="text-center text-lg text-[#666] mb-16 max-w-2xl mx-auto">
            ntropiq is building new interfaces for teams to analyze data and build models through natural language
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="api-card border border-[#e5e5e5] rounded-lg p-8 transition-all duration-200 hover:border-[#ccc] hover:shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-[#1a1a1a]">Analytics API</h3>
              <p className="text-[#666] mb-4 text-sm">
                Natural language to insights API for business intelligence, dashboards, and data exploration
              </p>
              <a
                href="#"
                className="text-[#1a1a1a] no-underline font-medium text-sm border-b border-[#e5e5e5] hover:border-[#999] transition-colors duration-200"
              >
                Analytics Playground
              </a>
            </div>

            <div className="api-card border border-[#e5e5e5] rounded-lg p-8 transition-all duration-200 hover:border-[#ccc] hover:shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-[#1a1a1a]">Model Building API</h3>
              <p className="text-[#666] mb-4 text-sm">
                Transform business objectives into production ML models through conversational interfaces
              </p>
              <a
                href="#"
                className="text-[#1a1a1a] no-underline font-medium text-sm border-b border-[#e5e5e5] hover:border-[#999] transition-colors duration-200"
              >
                Model Playground
              </a>
            </div>

            <div className="api-card border border-[#e5e5e5] rounded-lg p-8 transition-all duration-200 hover:border-[#ccc] hover:shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-[#1a1a1a]">Advanced Analytics API</h3>
              <p className="text-[#666] mb-4 text-sm">
                Complex statistical analysis, forecasting, and custom analytical workflows from natural language
              </p>
              <a
                href="#"
                className="text-[#1a1a1a] no-underline font-medium text-sm border-b border-[#e5e5e5] hover:border-[#999] transition-colors duration-200"
              >
                Advanced Playground
              </a>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href="#"
              className="bg-[#1a1a1a] text-white px-6 py-3 border-none rounded-md font-medium no-underline transition-all duration-200 text-base hover:bg-[#333]"
            >
              API Platform
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 text-center bg-[#1a1a1a] text-white">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-semibold mb-4">Start analyzing and modeling</h2>
          <p className="text-base mb-8 text-[#ccc]">
            Join thousands of business teams and data scientists already getting insights 10x faster with ntropiq
          </p>
          <Link
            href="/signin"
            className="bg-white text-[#1a1a1a] text-base px-6 py-3 border-none rounded-md font-medium no-underline transition-all duration-200 hover:bg-[#f5f5f5]"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#fafafa] py-12 pb-8 border-t border-[#e5e5e5]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 text-[#1a1a1a] text-sm">Platform</h4>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Analytics Engine
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Model Building
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Advanced Analytics
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Data Connectors
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Integrations
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#1a1a1a] text-sm">Resources</h4>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Documentation
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                API Reference
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Analytics Tutorials
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Model Examples
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Case Studies
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#1a1a1a] text-sm">Company</h4>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                About
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Careers
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Research
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Security
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Privacy
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#1a1a1a] text-sm">Support</h4>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Help Center
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Contact Sales
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Enterprise
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Status
              </a>
              <a
                href="#"
                className="text-[#666] no-underline block mb-2 text-sm hover:text-[#1a1a1a] transition-colors duration-200"
              >
                Community
              </a>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-[#e5e5e5] text-[#999] text-sm">
            <p>&copy; 2025 ntropiq. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
