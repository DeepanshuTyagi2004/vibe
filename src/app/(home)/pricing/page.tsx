"use client"
import { PricingTable } from '@clerk/nextjs'
import Image from 'next/image'
import React from 'react'
import { dark } from '@clerk/themes'
import { useCurrentTheme } from '@/hooks/use-theme'

const Page = () => {
  const currentTheme = useCurrentTheme();
  return (
    <div className='flex flex-col max-w-3xl mx-auto w-full'>
      <section className='space-y-6 pt-[16vh] 2xl:pt-48'>
        <div className='flex flex-col items-center'>
          <Image
            src="/logo.svg"
            alt='Vibe'
            width={50}
            height={50}
            className='hidden md:block'
          />
        </div>
        <h1 className='text-xl md:text-3xl font-bold text-center'>
          Pricing
        </h1>
        <p className='text-muted-foreground text-sm text-center md:text-base'>
          Choose the plan that fits your needs
        </p>
        <PricingTable
          appearance={{
            baseTheme: currentTheme === "dark" ? dark: undefined,
            elements: {
              pricingTableCard: "border! shadow-none! rounded-lg!",
              subscriptionDetailsCardBody: "z-50!",
            }
          }}
        />
        </section>
    </div>
  )
}

export default Page