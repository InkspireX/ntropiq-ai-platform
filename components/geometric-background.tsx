"use client"

import { useEffect, useRef } from "react"

export function GeometricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const orbs: Array<{
      x: number
      y: number
      baseX: number
      baseY: number
      size: number
      vx: number
      vy: number
      opacity: number
    }> = []

    // Create floating orbs
    for (let i = 0; i < 8; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseX: Math.random() * canvas.width,
        baseY: Math.random() * canvas.height,
        size: Math.random() * 200 + 100, // 100-300px
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.03 + 0.01, // 0.01-0.04
      })
    }

    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.01

      if (!prefersReducedMotion) {
        orbs.forEach((orb) => {
          // Gentle drift movement
          orb.x += orb.vx
          orb.y += orb.vy

          // Bounce off edges
          if (orb.x < -orb.size || orb.x > canvas.width + orb.size) orb.vx *= -1
          if (orb.y < -orb.size || orb.y > canvas.height + orb.size) orb.vy *= -1

          // Subtle cursor interaction
          const dx = mouseRef.current.x - orb.x
          const dy = mouseRef.current.y - orb.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 200) {
            const force = ((200 - distance) / 200) * 0.002
            orb.x -= dx * force
            orb.y -= dy * force
          }

          // Create gradient orb
          const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size)
          gradient.addColorStop(0, `rgba(156, 163, 175, ${orb.opacity})`) // gray-400
          gradient.addColorStop(1, "rgba(156, 163, 175, 0)")

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />
}
