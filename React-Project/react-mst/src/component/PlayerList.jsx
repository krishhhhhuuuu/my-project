import React, { useState } from "react";

const players = [
  { id: 1, name: "Virat Kohli", role: "Batsman" },
  { id: 2, name: "Rashid Khan", role: "Bowler" },
  { id: 3, name: "MS Dhoni", role: "Wicketkeeper" },
  { id: 4, name: "Ben Stokes", role: "Allrounder" },
  { id: 5, name: "Jasprit Bumrah", role: "Bowler" }
];

function PlayerList() {
  const [searchRole, setSearchRole] = useState("");

  const filteredPlayers = players.filter(player =>
    player.role.toLowerCase().includes(searchRole.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search by role"
        value={searchRole}
        onChange={(e) => setSearchRole(e.target.value)}
        style={{ padding: "8px", marginBottom: "20px", width: "200px" }}
      />

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.map(player => (
            <tr key={player.id}>
              <td>{player.id}</td>
              <td>{player.name}</td>
              <td>{player.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlayerList;
