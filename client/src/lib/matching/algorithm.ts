/**
 * Package Matching Algorithm
 * Matches event packages to event requirements based on multiple criteria
 */

import type { Package, Event } from '@/types';

export interface MatchedPackage extends Package {
  score: number;
  distance: number;
}

/**
 * Match packages to an event based on criteria
 * @param packages - Available packages to match
 * @param event - Event to match packages against
 * @returns Sorted array of matched packages with scores
 */
export function matchPackages(packages: Package[], event: Event): MatchedPackage[] {
  return packages
    .filter(pkg => applyHardFilters(pkg, event))
    .map(pkg => ({
      ...pkg,
      distance: calculateDistance(
        pkg.vendor?.location_lat || 0,
        pkg.vendor?.location_lng || 0,
        event.location_lat,
        event.location_lng
      ),
      score: 0,
    }))
    .filter(pkg => pkg.distance <= 20) // Within 20 miles
    .map(pkg => ({
      ...pkg,
      score: calculateScore(pkg, event),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20); // Return top 20 matches
}

/**
 * Apply hard filters (must-have criteria)
 */
function applyHardFilters(pkg: Package, event: Event): boolean {
  // Package must have sufficient capacity
  if (pkg.capacity < event.guest_count) {
    return false;
  }

  // Package price range must overlap with budget
  if (pkg.price_max < event.budget || pkg.price_min > event.budget) {
    return false;
  }

  // Package must be published
  if (pkg.status !== 'published') {
    return false;
  }

  return true;
}

/**
 * Calculate match score (0-100)
 * Higher score = better match
 */
export function calculateScore(pkg: MatchedPackage, event: Event): number {
  let score = 0;

  // 1. Distance proximity (0-40 points)
  // Closer = better. 0 miles = 40 points, 20 miles = 0 points
  score += Math.max(0, 40 - pkg.distance * 2);

  // 2. Budget match (0-30 points)
  // Package price range closer to budget = better
  const budgetMid = (pkg.price_min + pkg.price_max) / 2;
  const budgetDiff = Math.abs(budgetMid - event.budget);
  const budgetMatchPercentage = 1 - Math.min(budgetDiff / event.budget, 1);
  score += budgetMatchPercentage * 30;

  // 3. Capacity match (0-20 points)
  // Ideal: package capacity is 1-1.5x event guest count
  const capacityRatio = pkg.capacity / event.guest_count;
  if (capacityRatio >= 1 && capacityRatio <= 1.5) {
    score += 20; // Perfect fit
  } else if (capacityRatio > 1.5 && capacityRatio <= 2) {
    score += 15; // Slightly oversized but acceptable
  } else if (capacityRatio > 2) {
    score += Math.max(0, 20 - (capacityRatio - 2) * 5); // Too large
  }

  // 4. Service completeness (0-10 points)
  // More services included = better
  const servicesCount = pkg.vendor?.services?.length || 0;
  score += Math.min(servicesCount * 3, 10);

  // Future enhancements (not implemented in P0):
  // - Vendor rating (0-10 points)
  // - Number of completed events (0-5 points)
  // - Response time history (0-5 points)

  return Math.round(score);
}

/**
 * Calculate geographic distance between two points (Haversine formula)
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filter packages by search criteria
 * Used for browse page filters
 */
export interface PackageFilters {
  minBudget?: number;
  maxBudget?: number;
  minCapacity?: number;
  maxCapacity?: number;
  maxDistance?: number;
  services?: string[];
  eventType?: string;
}

export function filterPackages(
  packages: MatchedPackage[],
  filters: PackageFilters
): MatchedPackage[] {
  return packages.filter(pkg => {
    // Budget filter
    if (filters.minBudget && pkg.price_max < filters.minBudget) {
      return false;
    }
    if (filters.maxBudget && pkg.price_min > filters.maxBudget) {
      return false;
    }

    // Capacity filter
    if (filters.minCapacity && pkg.capacity < filters.minCapacity) {
      return false;
    }
    if (filters.maxCapacity && pkg.capacity > filters.maxCapacity) {
      return false;
    }

    // Distance filter
    if (filters.maxDistance && pkg.distance > filters.maxDistance) {
      return false;
    }

    // Services filter
    if (filters.services && filters.services.length > 0) {
      const hasAllServices = filters.services.every(service =>
        pkg.vendor?.services?.includes(service)
      );
      if (!hasAllServices) {
        return false;
      }
    }

    return true;
  });
}
