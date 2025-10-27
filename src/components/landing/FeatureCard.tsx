'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  index: number
  children?: ReactNode
}

export function FeatureCard({ icon: Icon, title, description, index, children }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative glass-strong rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />

      {/* Icon container with gradient */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent p-0.5 mb-6"
      >
        <div className="w-full h-full bg-card rounded-xl flex items-center justify-center">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </motion.div>

      {/* Content */}
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>

      {children}
    </motion.div>
  )
}
