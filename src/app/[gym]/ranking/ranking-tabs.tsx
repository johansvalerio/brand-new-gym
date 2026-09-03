"use client"

import { Flame, Utensils } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SharedRoutines } from "@/_features/gym-routines/components/SharedRoutines"
import { SharedNutrition } from "@/_features/gym-nutrition/components/SharedNutrition"

export function RankingTabs() {
  return (
    <Tabs defaultValue="routines" className="flex flex-col gap-6">
      <TabsList className="self-start">
        <TabsTrigger value="routines">
          <Flame /> Rutinas
        </TabsTrigger>
        <TabsTrigger value="nutrition">
          <Utensils /> Nutrición
        </TabsTrigger>
      </TabsList>

      <TabsContent value="routines" className="mt-0">
        <SharedRoutines />
      </TabsContent>
      <TabsContent value="nutrition" className="mt-0">
        <SharedNutrition />
      </TabsContent>
    </Tabs>
  )
}
