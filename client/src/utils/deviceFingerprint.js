export function getDeviceFingerprint(selectedLocation = "Normal") {
  const userAgent = navigator.userAgent || "";
  
  let os = "Unknown OS";
  if (userAgent.includes("Win")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "MacOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";

  let browser = "Unknown Browser";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edg")) browser = "Edge";

  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  return {
    deviceInfo: {
      browser,
      os,
      screenResolution,
      userAgent
    },
    location: selectedLocation
  };
}
