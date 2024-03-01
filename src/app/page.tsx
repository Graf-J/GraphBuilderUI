"use client"

import Link from 'next/link'
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from '@nextui-org/button';

export default function Home() {
  const description = "Introducing Graphify - a piece of software empowering users to craft projects in order to obtain access to a personalized and typesafe language to query data from graph databases via GraphQL"

  return (
    <div className="min-h-screen w-full bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4 flex flex-col items-center">
        <h1 className="relative z-0 text-9xl md:text-9xl bg-clip-text text-transparent bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 text-center font-sans font-bold mb-20">
          Graphify
        </h1>
        <TextGenerateEffect words={description} />
      </div>
      <div className="w-full max-w-4xl mx-auto p-4 flex justify-center mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 5, duration: 0.5 }}
        className="w-full max-w-4xl mx-auto p-4 flex justify-center mt-2"
      >
          <Button className="z-10" color="primary" size="lg">
            <Link href="/projects">Build Project</Link>
          </Button>
      </motion.div>
      </div>
      <BackgroundBeams />
    </div>
  );
}
