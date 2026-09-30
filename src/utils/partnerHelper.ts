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
    Object.entries(appData.partnerConnections).forEach(([userId, conn]) => {
      if (
        conn &&
        conn.pairedUserId &&
        !conn.pairedUserId.startsWith('partner_') &&
        cleanedFounders[conn.pairedUserId]
      ) {
        cleanedPartnerConnections[userId] = conn;
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
 * Get the real connected partner profile for a given user ID
 */
export function getPartnerForUser(appData: SharedAppData, userId: string): UserProfile | null {
  if (!appData || !userId) return null;

  const cleaned = cleanAppData(appData);

  // 1. Check partnerConnections map for this user
  const userConn = cleaned.partnerConnections?.[userId];
  if (userConn && userConn.status === 'accepted' && userConn.pairedUserId) {
    const partner = cleaned.founders[userConn.pairedUserId];
    if (partner) return partner;
  }

  // 2. Check if any other user's partnerConnections maps to this user
  if (cleaned.partnerConnections) {
    for (const [otherId, conn] of Object.entries(cleaned.partnerConnections)) {
      if (otherId !== userId && conn.status === 'accepted' && conn.pairedUserId === userId) {
        const partner = cleaned.founders[otherId];
        if (partner) return partner;
      }
    }
  }

  // 3. Fallback to legacy partnerConnection if pairedUserId != userId
  if (
    cleaned.partnerConnection &&
    cleaned.partnerConnection.status === 'accepted' &&
    cleaned.partnerConnection.pairedUserId &&
    cleaned.partnerConnection.pairedUserId !== userId
  ) {
    const partner = cleaned.founders[cleaned.partnerConnection.pairedUserId];
    if (partner) return partner;
  }

  return null;
}

/**
 * Check if activeUser is paired with partner
 */
export function isPartnerConnectedForUser(appData: SharedAppData, userId: string): boolean {
  return !!getPartnerForUser(appData, userId);
}
