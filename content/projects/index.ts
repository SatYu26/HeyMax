import type { Project } from "../types";
import { anq } from "./anq";
import { flightBooking } from "./flight-booking";
import { alphaTribe } from "./alphatribe";

export const projects: Project[] = [anq, flightBooking, alphaTribe];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
