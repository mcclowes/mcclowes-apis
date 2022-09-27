// assign form
const assignFormRank = (list) => {
  list.sort((a, b) => {
    return a.form - b.form;
  });

  return list.map((player, i) => {
    player["form_rank"] = i;

    return player;
  });
};

export default assignFormRank;
