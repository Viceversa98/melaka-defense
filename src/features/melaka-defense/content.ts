export const DEFAULT_CODE = `// Choose the closest living enemy ship.
const getNearestShip = (radar) => {
  const ships = radar.getShips();

  return ships
    .filter((ship) => ship.hp > 0)
    .sort((a, b) => a.distance - b.distance)[0];
};

function cannon1(radar, artillery, command) {
  const nearestShip = getNearestShip(radar);

  if (!nearestShip) {
    return;
  }

  // Use Meriam for stronger ships.
  if (nearestShip.type === "Colonizer Galleon" || nearestShip.hp > 40) {
    artillery.fireMeriam(nearestShip.id);
    command.log("Cannon 1 Meriam locked on " + nearestShip.type + ".");
    return;
  }

  // Use a for loop to fire 2 or 3 Rentaka shots.
  for (let bullet = 0; bullet < 3; bullet++) {
    artillery.fireRentaka(nearestShip.id);
  }
  command.log("Cannon 1 fired a 3-bullet Rentaka burst at " + nearestShip.id + ".");
}
`;

export const LEARNING_GUIDES = [
  {
    title: "Simple Command Call",
    description: "Call one API method to make one cannon action.",
    code: "artillery.fireRentaka(ship.id);\ncommand.log(\"Rentaka fired.\");",
  },
  {
    title: "For Loop",
    description: "Repeat an action. Rentaka allows 3 bullets per cannon per tick.",
    code: "for (let bullet = 0; bullet < 3; bullet++) {\n  artillery.fireRentaka(ship.id);\n}",
  },
  {
    title: "If Else",
    description: "Choose different weapons based on ship type or HP.",
    code: "if (ship.type === \"Colonizer Galleon\") {\n  artillery.fireMeriam(ship.id);\n} else {\n  artillery.fireRentaka(ship.id);\n}",
  },
  {
    title: "Recursion",
    description: "A function can call itself, but always include a base case.",
    code: "const countShips = (ships, index = 0) => {\n  if (index >= ships.length) return 0;\n  return 1 + countShips(ships, index + 1);\n};",
  },
];

export const BEST_PRACTICES = [
  "Use early returns when there is no target.",
  "Keep repeated logic in helper functions.",
  "Avoid infinite loops like while (true).",
  "Prefer clear names such as nearestShip and weakestShip.",
];

export const DEFEAT_TIPS = [
  "Use if/else to reserve Meriam for Colonizer Galleons or ships with high HP.",
  "Use a for loop to fire up to 3 Rentaka shots from a cannon in one tick.",
  "Sort radar.getShips() by distance so the nearest ship is handled first.",
  "Split logic across cannon1, cannon2, and cannon3 so every cannon contributes.",
];

