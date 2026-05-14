'use server';
/**
 * @fileOverview An AI-powered concierge for Chalke Homestay.
 *
 * - aiKonkaniConcierge - A function that provides personalized Konkani dish and day-trip recommendations.
 * - AiKonkaniConciergeInput - The input type for the aiKonkaniConcierge function.
 * - AiKonkaniConciergeOutput - The return type for the aiKonkaniConcierge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiKonkaniConciergeInputSchema = z.object({
  guestName: z.string().describe('The name of the guest for personalization.'),
  foodPreferences: z
    .string()
    .describe('Guest preferences for food, e.g., "vegetarian", "spicy", "seafood lover".'),
  activityPreferences: z
    .string()
    .describe('Guest preferences for activities, e.g., "adventure", "relaxation", "cultural", "nature walks".'),
  durationInDays: z.number().int().min(1).describe('Number of days for the itinerary recommendation.'),
  dietaryRestrictions: z
    .string()
    .optional()
    .describe('Any specific dietary restrictions, e.g., "no gluten", "no dairy".'),
});
export type AiKonkaniConciergeInput = z.infer<typeof AiKonkaniConciergeInputSchema>;

const AiKonkaniConciergeOutputSchema = z.object({
  dishRecommendations: z
    .array(
      z.object({
        name: z.string().describe('Name of the Konkani dish.'),
        description: z.string().describe('A brief description of the dish.'),
        isVegetarian: z.boolean().describe('True if the dish is vegetarian, false otherwise.'),
      })
    )
    .describe('Personalized recommendations for Konkani dishes.'),
  itineraryRecommendations: z
    .array(
      z.object({
        day: z.number().int().min(1).describe('The day number in the itinerary.'),
        activities: z
          .array(
            z.object({
              time: z.string().describe('Time of the activity, e.g., "Morning", "Afternoon", "Evening".'),
              description: z.string().describe('Description of the activity.'),
              location: z.string().describe('Location of the activity, e.g., "Sawatsada Waterfall", "Homestay Terrace".'),
            })
          )
          .describe('List of activities planned for the day.'),
        notes: z.string().optional().describe('Additional notes or tips for the day.'),
      })
    )
    .describe('Personalized day-trip itineraries.'),
});
export type AiKonkaniConciergeOutput = z.infer<typeof AiKonkaniConciergeOutputSchema>;

export async function aiKonkaniConcierge(input: AiKonkaniConciergeInput): Promise<AiKonkaniConciergeOutput> {
  return aiKonkaniConciergeFlow(input);
}

const aiKonkaniConciergePrompt = ai.definePrompt({
  name: 'aiKonkaniConciergePrompt',
  input: {schema: AiKonkaniConciergeInputSchema},
  output: {schema: AiKonkaniConciergeOutputSchema},
  prompt: `You are an AI-powered concierge for Chalke Homestay, an eco-retreat offering authentic Konkani village hospitality.
Your goal is to provide personalized recommendations for Konkani dishes and day-trip itineraries.

Here are the guest's preferences:
Guest Name: {{{guestName}}}
Food Preferences: {{{foodPreferences}}}
Activity Preferences: {{{activityPreferences}}}
Duration of Stay: {{{durationInDays}}} days
{{#if dietaryRestrictions}}Dietary Restrictions: {{{dietaryRestrictions}}}{{/if}}

Based on these preferences, provide a unique and enjoyable experience for the guest.

For dish recommendations, suggest authentic Konkani dishes that align with their food preferences and dietary restrictions, if any. Ensure a variety of options.

For itinerary recommendations, create a day-by-day plan for the specified duration. Focus on activities that match their preferences, incorporating local attractions like Sawatsada Waterfall, Parshuram Temple, Vashishti River, Vindhyavasini Temple, Gowalkot Fort, Shivaji Museum (Dervan), and Koyna Dam Area, as well as homestay experiences like terrace dining and nature walks around the river and mountains. Ensure the itinerary feels peaceful, scenic, and immersive.

Always respond with structured JSON output according to the provided schema.`, 
});

const aiKonkaniConciergeFlow = ai.defineFlow(
  {
    name: 'aiKonkaniConciergeFlow',
    inputSchema: AiKonkaniConciergeInputSchema,
    outputSchema: AiKonkaniConciergeOutputSchema,
  },
  async input => {
    const {output} = await aiKonkaniConciergePrompt(input);
    return output!;
  }
);
