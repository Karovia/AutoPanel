export function canUseCapability(grants: string[], capability: string) {
  return grants.includes(capability);
}
