import { useState } from "react";

import { FoldArrow } from "./foldArrow";
import { DateCell } from "./Cells/dateCell";
import { NameCell } from "./Cells/nameCell";
import { MoreCell } from "./Cells/moreCell";
import { VoteTTCell } from "./Cells/voteTTCell";
import { ResultCell } from "./Cells/resultCell";
import { VotesColCell } from "./Cells/votesColCell";
import { PartyCell } from "./Cells/partyCell";

export function TableRow({
  content,
  index,
  older = [],
  newest,
  thingmadur,
  mal,
  dags,
  name,
  party,
  more,
  votesColor,
  voteTotal,
  results,
}) {
  const [open, setOpen] = useState(false);
  const row = index % 2 ? "odd" : "even";
  const link = content.atkvGrNr
    ? `/nanar/${content.atkvGrNr}`
    : `/thingmadur/${content.id}`;
  const checkedLink = link ? link : ``;

  return (
    <>
      <tr
        key={content.atkvGrNr || content.id}
        className={row + " mal"}
        data-nr={content.nr || ``}
        data-atkvgrnr={content.atkvGrNr || ``}
        // data-date={content.date || ``}
        // data-time={content.time || ``}
      >
        {newest && <FoldArrow open={open} onClick={() => setOpen(!open)} />}
        {dags && <DateCell date={content.date} />}
        {name && <NameCell name={content.name} link={checkedLink} />}
        {party && <PartyCell party={content.flokkur} />}
        {more && <MoreCell link={checkedLink} />}
        {votesColor && <VotesColCell thingmadur={thingmadur.name} mal={mal} />}
        {voteTotal && <VoteTTCell atkv={content.atkv} />}
        {results && <ResultCell atkv={content.atkv} />}
      </tr>
      {open &&
        older.map((mal, i) => (
          <tr
            key={mal.atkvGrNr}
            className={((index + i) % 2 ? "even" : "odd") + " mal"}
          >
            <td></td>
            {dags && <DateCell date={mal.date} />}
            {mal && <NameCell name={mal.name} />}
            {more && <MoreCell link={checkedLink} />}
            {votesColor && (
              <VotesColCell thingmadur={thingmadur.name} mal={mal} />
            )}
            {voteTotal && <VoteTTCell atkv={mal.atkv} />}
            {results && <ResultCell atkv={mal.atkv} />}
          </tr>
        ))}
    </>
  );
}
