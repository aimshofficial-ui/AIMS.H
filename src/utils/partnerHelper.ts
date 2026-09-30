import { SharedAppData, UserProfile, PartnerConnection } from '../types';

/**
 * Clean app data by stripping out any dummy fallback mock users ('Co-Founder Partner')
 */
export function cleanAppData(appData: SharedAppData): SharedAppData {
  if (!appData || !appData.founders) return appData;

  const cleanedFounders: Record<string, UserProfile> = {};
  Object.entries(appData.founders).forEach(([id, user]) => {
    if (
      user &&
      user.name !== 'Co-Founder Partner' &&
      !id.startsWith('partner_') &&
      user.username !== 'partner'
    ) {
      cleanedFounders[id] = user;
    }
  });

  const cleanedPartnerConnections: Record<string, PartnerConnection> = {};
  if (appData.partnerConnections) {
    Object.entries(appData.partnerConnections).forEach(([key, conn]) => {
      if (
        conn &&
        conn.pairedUserId &&
        !conn.pairedUserId.startsWith('partner_') &&
        cleanedFounders[conn.pairedUserId]
      ) {
        cleanedPartnerConnections[key] = conn;
      }
    });
  }

  let cleanedLegacyConnection = appData.partnerConnection;
  if (
    appData.partnerConnection &&
    (appData.partnerConnection.pairedUserId.startsWith('partner_') ||
      !cleanedFounders[appData.partnerConnection.pairedUserId])
  ) {
    cleanedLegacyConnection = {
      partnerInviteCode: '',
      status: 'none',
      pairedUserId: '',
    };
  }

  return {
    ...appData,
    founders: cleanedFounders,
    partnerConnections: cleanedPartnerConnections,
    partnerConnection: cleanedLegacyConnection,
  };
}

/**
 * Get all real connected partner profiles for a given user ID (supports 10-12 partners)
 */
export function getAllPartnersForUser(appData: SharedAppData, userId: string): UserProfile[] {
  if (!appData || !userId) return [];

  const cleaned = cleanAppData(appData);
  const partnersMap = new Map<string, UserProfile>();

  // 1. Scan partnerConnections mapping keys (userA_userB or userB_userA)
  if (cleaned.partnerConnections) {
    Object.entries(cleaned.partnerConnections).forEach(([key, conn]) => {
      if (conn && conn.status === 'accepted' && conn.pairedUserId) {
        const isMatched = key.startsWith(`${userId}_`) || 
                          key.endsWith(`_${userId}`) || 
                          key === userId || 
                          conn.pairedUserId !== userId;

        if (isMatched) {
          const partner = cleaned.founders[conn.pairedUserId];
          if (partner && partner.id !== userId) {
            partnersMap.set(partner.id, partner);
          }
        }
      }
    });
  }

  // 2. Legacy partnerConnection mapping (backward compatibility)
  if (
    cleaned.partnerConnection &&
    cleaned.partnerConnection.status === 'accepted' &&
    cleaned.partnerConnection.pairedUserId &&
    cleaned.partnerConnection.pairedUserId !== userId
  ) {
    const partner = cleaned.founders[cleaned.partnerConnection.pairedUserId];
    if (partner) {
      partnersMap.set(partner.id, partner);
    }
  }

  return Array.from(partnersMap.values());
}

/**
 * Get the first real connected partner profile for a given user ID
 */
export function getPartnerForUser(appData: SharedAppData, userId: string): UserProfile | null {
  const list = getAllPartnersForUser(appData, userId);
  return list.length > 0 ? list[0] : null;
}

/**
 * Check if activeUser is paired with at least one partner
 */
export function isPartnerConnectedForUser(appData: SharedAppData, userId: string): boolean {
  return getAllPartnersForUser(appData, userId).length > 0;
}
