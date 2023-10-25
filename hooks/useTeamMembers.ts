import { useRecoilState } from "recoil";
import { TeamMemberItemType, teamMemberState } from "../atoms/app";
import { useEffect } from "react";
import { db } from "../utils/firebase";
import { useQuery } from "react-query";
import { wenderApi } from "../api";
import { DBCollection } from "../types/common";

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useRecoilState(teamMemberState);

  const {
    isLoading,
    data: teamMembersRes,
    refetch,
  } = useQuery(
    DBCollection.TEAM_MEMBERS,
    async () => {
      return await wenderApi.get("/superadmin/getAllRefillers");
    },
    {
      enabled: teamMembers.shouldRefetch || teamMembers.items.length === 0,
    }
  );

  useEffect(() => {
    if (teamMembersRes) {
      const ps: TeamMemberItemType[] = teamMembersRes.data.data.team_members;
      setTeamMembers((r) => ({
        ...r,
        isLoading: false,
        items: teamMembersRes.data.data.team_members.map(
          (p: TeamMemberItemType) => ({
            ...p,
            _docID: p.user_id,
          })
        ),
        shouldRefetch: false,
      }));

      const batch = db.batch();
      ps.forEach((p) => {
        const ref = db.collection(DBCollection.TEAM_MEMBERS).doc(p.user_id);
        batch.set(ref, p, { merge: true });
      });
      batch.commit();
    }
  }, [teamMembersRes?.data.data.team_members]);

  return { teamMembers, isLoading, refetch };
};
