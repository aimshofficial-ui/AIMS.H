import { SharedAppData, UserProfile, PartnerRequest } from '../types';

/**
 * Returns the currently paired partner UserProfile for the given activeUserId.
 * Checks both accepted partnerRequests and partnerConnection state.
 */
export function getPairedPartner(appData: SharedAppData, activeUserId: string): UserProfile | null {
  if (!activeUserId || !appData) return null;
  const activeUser = appData.founders?.[activeUserId];
  const userInviteCode = activeUser?.inviteCode || '';

  // 1. Check accepted partner requests
  const acceptedReq = (appData.partnerRequests || []).find(
    (req) => req.status === 'accepted' && (
      req.fromUserId === activeUserId || 
      (userInviteCode && req.targetInviteCode === userInviteCode)
    )
  );

  if (acceptedReq) {
    let partnerId = '';
    if (acceptedReq.fromUserId === activeUserId) {
      // Find user with target invite code
      const matched = Object.values(appData.founders || {}).find(
        (f) => f.inviteCode === acceptedReq.targetInviteCode
      );
      partnerId = matched?.id || '';
    } else {
      partnerId = acceptedReq.fromUserId;
    }

    if (partnerId && appData.founders?.[partnerId] && partnerId !== activeUserId) {
      return appData.founders[partnerId];
    }
  }

  // 2. Check partnerConnection
  if (appData.partnerConnection?.status === 'accepted') {
    const pairedId = appData.partnerConnection.pairedUserId;
    if (pairedId && appData.founders?.[pairedId] && pairedId !== activeUserId) {
      return appData.founders[pairedId];
    }
    
    // If pairedUserId happens to be active user or partner code matched
    const partnerByCode = Object.values(appData.founders || {}).find(
      (f) => f.id !== activeUserId && (
        f.inviteCode === appData.partnerConnection.partnerInviteCode ||
        f.id === appData.partnerConnection.pairedUserId
      )
    );
    if (partnerByCode) {
      return partnerByCode;
    }

    // Fallback: check if there's any other registered founder in founders
    const otherFounder = Object.values(appData.founders || {}).find((f) => f.id !== activeUserId);
    if (otherFounder) {
      return otherFounder;
    }
  }

  return null;
}
