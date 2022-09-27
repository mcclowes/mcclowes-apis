const positions = ["goa", "def", "mid", "str"];

const position = (player) => positions[player["element_type"] - 1];

export default position;
