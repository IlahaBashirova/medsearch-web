export function cleanPhoneToTel(phoneText) {
  const digits = String(phoneText || "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}