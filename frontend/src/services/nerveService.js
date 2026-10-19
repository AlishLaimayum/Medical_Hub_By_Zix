/**
 * Dental Nerve API Service
 * Clean data-access layer for the Medical Hub By Zix Spring Boot backend.
 * Provides fallback to validated local data with loading, error, and retry states.
 */

import { DENTAL_NERVES_DATA, ALL_NERVE_IDS } from "../data/nervesData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const NERVES_ENDPOINT = `${API_BASE_URL}/api/v1/anatomy/nerves`;

/**
 * @typedef {Object} ServiceResponse
 * @property {boolean} success - Whether the request succeeded
 * @property {any} data - The payload
 * @property {'live_api' | 'offline_bundle'} source - Origin of the data
 * @property {string | null} error - Error message if failed
 */

class NerveService {
  /**
   * Fetch all dental nerves with metadata
   * @param {Object} options
   * @param {boolean} [options.preferLive=true] - Attempt to call the Spring Boot API first
   * @returns {Promise<ServiceResponse>}
   */
  async getAllNerves({ preferLive = true } = {}) {
    if (preferLive) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s quick timeout

        const response = await fetch(NERVES_ENDPOINT, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          return {
            success: true,
            data: json.data || json,
            source: "live_api",
            error: null,
          };
        }
      } catch (err) {
        // Fall through to offline bundle gracefully
        console.info(
          "Medical Hub API offline or unreachable; using local validated neuroanatomy atlas.",
          err.message
        );
      }
    }

    // Offline / Fallback bundle
    return {
      success: true,
      data: Object.values(DENTAL_NERVES_DATA),
      source: "offline_bundle",
      error: null,
    };
  }

  /**
   * Fetch complete clinical details for a single nerve by anatomical ID
   * @param {string} nerveId - Stable anatomical identifier (e.g. 'nerve-ian')
   * @param {Object} options
   * @param {boolean} [options.preferLive=true]
   * @returns {Promise<ServiceResponse>}
   */
  async getNerveById(nerveId, { preferLive = true } = {}) {
    if (!nerveId) {
      return {
        success: false,
        data: null,
        source: "offline_bundle",
        error: "Invalid nerve identifier provided",
      };
    }

    if (preferLive) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch(`${NERVES_ENDPOINT}/${encodeURIComponent(nerveId)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          return {
            success: true,
            data: json.data || json,
            source: "live_api",
            error: null,
          };
        }
      } catch (err) {
        console.info(`API fetch for ${nerveId} fell back to local bundle:`, err.message);
      }
    }

    // Local fallback
    const localData = DENTAL_NERVES_DATA[nerveId];
    if (localData) {
      return {
        success: true,
        data: localData,
        source: "offline_bundle",
        error: null,
      };
    }

    return {
      success: false,
      data: null,
      source: "offline_bundle",
      error: `Anatomical structure with ID '${nerveId}' not found in registry.`,
    };
  }

  /**
   * Get all local anesthesia procedures indexed across all nerves
   */
  async getAnesthesiaBlocks() {
    const nerves = Object.values(DENTAL_NERVES_DATA);
    const blocks = [];
    const seen = new Set();

    nerves.forEach((n) => {
      (n.anesthesiaApplications || []).forEach((b) => {
        if (!seen.has(b.id)) {
          seen.add(b.id);
          blocks.push({
            ...b,
            parentNerveId: n.id,
            parentNerveName: n.name,
          });
        }
      });
    });

    return {
      success: true,
      data: blocks,
      source: "offline_bundle",
      error: null,
    };
  }
}

export const nerveService = new NerveService();
export default nerveService;
