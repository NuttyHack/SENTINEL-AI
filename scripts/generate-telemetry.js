import fs from 'fs';

const vinPrefixes = ['1FA6P8CF', '1FTFW1ED', '1N4AL3AP', '3FA6P0HD'];
const components = ['Thermal management', 'Connected cockpit', 'Electric steering', 'Brake Control Module'];
const dtcCodes = ['P0A80', 'P0217', 'U0100', 'C0035', 'P0300'];
const softwareVersions = ['4.7.9', '4.8.1', '4.8.2', '4.9.0'];

const stream = fs.createWriteStream('ford_fleet_telemetry_90days.csv');
stream.write('vin,timestamp,component,dtcCode,softwareVersion,mileage,ambientTempC,severity\n');

console.log('Generating 50,000 vehicle telemetry logs...');

for (let i = 0; i < 50000; i++) {
  const vin = vinPrefixes[Math.floor(Math.random() * vinPrefixes.length)] + Math.floor(10000000 + Math.random() * 90000000);
  
  // Random timestamp within the last 90 days
  const daysAgo = Math.floor(Math.random() * 90);
  const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  
  // Spike software version 4.8.2 with Thermal failures to create an actual pattern for Ford to discover!
  const isTargetedFault = Math.random() < 0.35;
  const softwareVersion = isTargetedFault ? '4.8.2' : softwareVersions[Math.floor(Math.random() * softwareVersions.length)];
  const component = softwareVersion === '4.8.2' && Math.random() < 0.6 ? 'Thermal management' : components[Math.floor(Math.random() * components.length)];
  
  const dtcCode = dtcCodes[Math.floor(Math.random() * dtcCodes.length)];
  const mileage = Math.floor(15000 + Math.random() * 45000);
  const ambientTempC = Math.floor(15 + Math.random() * 25);
  const severity = component === 'Thermal management' ? 'CRITICAL' : 'MEDIUM';

  stream.write(`${vin},${timestamp},${component},${dtcCode},${softwareVersion},${mileage},${ambientTempC},${severity}\n`);
}

stream.end();
console.log('Done! ford_fleet_telemetry_90days.csv generated successfully.');