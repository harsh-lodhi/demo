import { wenderApi } from "api";
import { TeamMemberItemType, teamMemberState } from "atoms/app";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useRecoilState } from "recoil";
import { DBCollection } from "types/common";
import { db } from "utils/firebase";

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
    },
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
          }),
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
  }, [setTeamMembers, teamMembersRes]);

  return { teamMembers, isLoading, refetch };
};
