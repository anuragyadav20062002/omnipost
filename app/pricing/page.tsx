"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Rocket, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Basic",
    price: "$11",
    features: [
      "90 content repurposes per month",
      "Connect Twitter and Facebook accounts",
      "Basic content generation",
      "Schedule up to 25 posts per month",
      "Basic analytics",
      "Email support",
    ],
    icon: Rocket,
  },
  {
    name: "Pro",
    price: "$20",
    features: [
      "180 content repurposes per month",
      "Connect Twitter and Facebook accounts",
      "Advanced content generation",
      "Schedule up to 55 posts per month",
      "Advanced analytics",
      "Priority support",
    ],
    icon: Sparkles,
  },
];

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (planName: string) => {
    setIsLoading(planName.toLowerCase());
    // Implement your subscription logic here
    // For now, we'll just show a toast
    toast({
      title: "Subscription Started",
      description: `You've subscribed to the ${planName} plan.`,
    });
    setIsLoading(null);
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Choose Your Plan
      </h1>
      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="flex flex-col h-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <plan.icon className="w-8 h-8" />
                </div>
                <CardDescription className="text-gray-100">
                  <span className="text-4xl font-bold">{plan.price}</span> / month
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3 py-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={isLoading === plan.name.toLowerCase()}
                >
                  {isLoading === plan.name.toLowerCase() ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

